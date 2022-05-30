const BigNumber = require('bignumber.js')
const { ADDRESS_ZERO } = require('../helpers/constants/')

const { reverts } = require('truffle-assertions')
const { ethers } = require('hardhat')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let locks

contract('Lock / purchaseFor', (accounts) => {
  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    await locks.FIRST.setMaxKeysPerAddress(10)
  })

  describe('when the contract has a public key release', () => {
    it('should fail if the price is not enough', async () => {
      await reverts(
        locks.FIRST.purchase(
          [],
          [accounts[0]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.0001', 'ether'),
          }
        ),
        'INSUFFICIENT_VALUE'
      )
      // Making sure we do not have a key set!
      assert.equal(
        await locks.FIRST.keyExpirationTimestampFor.call(accounts[0]),
        0
      )
    })

    it('should fail if we reached the max number of keys', async () => {
      await locks['SINGLE KEY'].purchase(
        [],
        [accounts[0]],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )
      await reverts(
        locks['SINGLE KEY'].purchase(
          [],
          [accounts[1]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
            from: accounts[1],
          }
        ),
        'LOCK_SOLD_OUT'
      )
    })

    it('should trigger an event when successful', async () => {
      const tx = await locks.FIRST.purchase(
        [],
        [accounts[2]],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: web3.utils.toWei('0.01', 'ether'),
        }
      )
      assert.equal(tx.logs[0].event, 'Transfer')
      assert.equal(tx.logs[0].args.from, 0)
      assert.equal(tx.logs[0].args.to, accounts[2])
      // Verify that RenewKeyPurchase does not emit on a first key purchase
      const includes = tx.logs.filter((l) => l.event === 'RenewKeyPurchase')
      assert.equal(includes.length, 0)
    })

    describe('when the user already owns an expired key', () => {
      it('should expand the validity by the default key duration', async () => {
        const tx = await locks.SECOND.purchase(
          [],
          [accounts[4]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
          }
        )
        assert.equal(await locks.SECOND.balanceOf(accounts[4]), 1)
        assert.equal(await locks.SECOND.getHasValidKey(accounts[4]), true)

        // let's now expire the key
        const { args } = tx.logs.find((v) => v.event === 'Transfer')
        await locks.SECOND.expireAndRefundFor(args.tokenId, 0)
        assert.equal(await locks.SECOND.getHasValidKey(accounts[4]), false)
        assert.equal(await locks.SECOND.balanceOf(accounts[4]), 0)

        // Purchase a new one
        await locks.SECOND.purchase(
          [],
          [accounts[4]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
          }
        )
        assert.equal(await locks.SECOND.balanceOf(accounts[4]), 1)
        assert.equal(await locks.SECOND.getHasValidKey(accounts[4]), true)
      })
    })

    describe('when the user already owns a non expired key', () => {
      it('should create a new key', async () => {
        await locks.FIRST.purchase(
          [],
          [accounts[1]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
          }
        )
        assert.equal(await locks.FIRST.balanceOf(accounts[1]), 1)
        await locks.FIRST.purchase(
          [],
          [accounts[1]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
          }
        )
        assert.equal(await locks.FIRST.balanceOf(accounts[1]), 2)
      })
    })

    describe('when the key was successfuly purchased', () => {
      let totalSupply
      let numberOfOwners
      let balance
      let now
      let tokenId

      beforeEach(async () => {
        balance = new BigNumber(await web3.eth.getBalance(locks.FIRST.address))
        totalSupply = new BigNumber(await locks.FIRST.totalSupply.call())
        numberOfOwners = new BigNumber(await locks.FIRST.numberOfOwners.call())
        const newKeyTx = await locks.FIRST.purchase(
          [],
          [accounts[0]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
          }
        )
        const { args } = newKeyTx.logs.find((v) => v.event === 'Transfer')
        tokenId = args.tokenId
        const transferBlock = await ethers.provider.getBlock(
          newKeyTx.receipt.blockNumber
        )
        now = transferBlock.timestamp
      })

      it('should have the right expiration timestamp for the key', async () => {
        const expirationTimestamp = new BigNumber(
          await locks.FIRST.keyExpirationTimestampFor.call(tokenId)
        )
        const expirationDuration = new BigNumber(
          await locks.FIRST.expirationDuration.call()
        )
        assert(expirationTimestamp.gte(expirationDuration.plus(now)))
      })

      it('should have added the funds to the contract', async () => {
        let newBalance = new BigNumber(
          await web3.eth.getBalance(locks.FIRST.address)
        )
        assert.equal(
          parseFloat(web3.utils.fromWei(newBalance.toFixed(), 'ether')),
          parseFloat(web3.utils.fromWei(balance.toFixed(), 'ether')) + 0.01
        )
      })

      it('should have increased the number of outstanding keys', async () => {
        const _totalSupply = new BigNumber(await locks.FIRST.totalSupply.call())
        assert.equal(_totalSupply.toFixed(), totalSupply.plus(1).toFixed())
      })

      it('should have increased the number of owners', async () => {
        const _numberOfOwners = new BigNumber(
          await locks.FIRST.numberOfOwners.call()
        )
        assert.equal(
          _numberOfOwners.toFixed(),
          numberOfOwners.plus(1).toFixed()
        )
      })
    })

    it('can purchase a free key', async () => {
      const tx = await locks.FREE.purchase(
        [],
        [accounts[2]],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]]
      )
      assert.equal(tx.logs[0].event, 'Transfer')
      assert.equal(tx.logs[0].args.from, 0)
      assert.equal(tx.logs[0].args.to, accounts[2])
    })
  })
})
