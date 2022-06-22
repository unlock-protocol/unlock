const BigNumber = require('bignumber.js')

const { deployLock, reverts, ADDRESS_ZERO } = require('../helpers/errors')
const { ethers } = require('hardhat')

contract('Lock / purchaseFor', (accounts) => {
  let lock
  let anotherLock
  let lockSingleKey
  let lockFree

  beforeEach(async () => {
    lock = await deployLock()
    anotherLock = await deployLock()
    lockSingleKey = await deployLock({ name: 'SINGLE KEY' })
    lockFree = await deployLock({ name: 'FREE' })
    await lock.setMaxKeysPerAddress(10)
  })

  describe('when the contract has a public key release', () => {
    it('should fail if the price is not enough', async () => {
      await reverts(
        lock.purchase([], [accounts[0]], [ADDRESS_ZERO], [ADDRESS_ZERO], [[]], {
          value: web3.utils.toWei('0.0001', 'ether'),
        }),
        'INSUFFICIENT_VALUE'
      )
      // Making sure we do not have a key set!
      assert.equal(await lock.keyExpirationTimestampFor(accounts[0]), 0)
    })

    it('should fail if we reached the max number of keys', async () => {
      await lockSingleKey.purchase(
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
        lockSingleKey.purchase(
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
      const tx = await lock.purchase(
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
        const tx = await anotherLock.purchase(
          [],
          [accounts[4]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
          }
        )
        assert.equal(await anotherLock.balanceOf(accounts[4]), 1)
        assert.equal(await anotherLock.getHasValidKey(accounts[4]), true)

        // let's now expire the key
        const { args } = tx.logs.find((v) => v.event === 'Transfer')
        await anotherLock.expireAndRefundFor(args.tokenId, 0)
        assert.equal(await anotherLock.getHasValidKey(accounts[4]), false)
        assert.equal(await anotherLock.balanceOf(accounts[4]), 0)

        // Purchase a new one
        await anotherLock.purchase(
          [],
          [accounts[4]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
          }
        )
        assert.equal(await anotherLock.balanceOf(accounts[4]), 1)
        assert.equal(await anotherLock.getHasValidKey(accounts[4]), true)
      })
    })

    describe('when the user already owns a non expired key', () => {
      it('should create a new key', async () => {
        await lock.purchase(
          [],
          [accounts[1]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
          }
        )
        assert.equal(await lock.balanceOf(accounts[1]), 1)
        await lock.purchase(
          [],
          [accounts[1]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
          }
        )
        assert.equal(await lock.balanceOf(accounts[1]), 2)
      })
    })

    describe('when the key was successfuly purchased', () => {
      let totalSupply
      let numberOfOwners
      let balance
      let now
      let tokenId

      beforeEach(async () => {
        balance = new BigNumber(await web3.eth.getBalance(lock.address))
        totalSupply = new BigNumber(await lock.totalSupply())
        numberOfOwners = new BigNumber(await lock.numberOfOwners())
        const newKeyTx = await lock.purchase(
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
          await lock.keyExpirationTimestampFor(tokenId)
        )
        const expirationDuration = new BigNumber(
          await lock.expirationDuration()
        )
        assert(expirationTimestamp.gte(expirationDuration.plus(now)))
      })

      it('should have added the funds to the contract', async () => {
        let newBalance = new BigNumber(await web3.eth.getBalance(lock.address))
        assert.equal(
          parseFloat(web3.utils.fromWei(newBalance.toFixed(), 'ether')),
          parseFloat(web3.utils.fromWei(balance.toFixed(), 'ether')) + 0.01
        )
      })

      it('should have increased the number of outstanding keys', async () => {
        const _totalSupply = new BigNumber(await lock.totalSupply())
        assert.equal(_totalSupply.toFixed(), totalSupply.plus(1).toFixed())
      })

      it('should have increased the number of owners', async () => {
        const _numberOfOwners = new BigNumber(await lock.numberOfOwners())
        assert.equal(
          _numberOfOwners.toFixed(),
          numberOfOwners.plus(1).toFixed()
        )
      })
    })

    it('can purchase a free key', async () => {
      const tx = await lockFree.purchase(
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
