const BigNumber = require('bignumber.js')
const unlockContract = artifacts.require('Unlock.sol')
const TestErc20Token = artifacts.require('TestErc20Token.sol')
const getUnlockProxy = require('../helpers/proxy')
const shouldFail = require('../helpers/shouldFail')
const deployLocks = require('../helpers/deployLocks')

let unlock, token, locks

contract('Unlock / erc20', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    token = await TestErc20Token.new()
    locks = await deployLocks(unlock, accounts[0], token.address)
  })

  describe('creating ERC20 priced locks', () => {
    let lock
    let keyPrice

    before(async () => {
      lock = locks['FIRST']
      keyPrice = new BigNumber(await lock.keyPrice.call())
    })

    describe('users can purchase keys', () => {
      const keyOwner = accounts[1]
      const defaultBalance = new BigNumber(100000000000000000)

      before(async () => {
        // Pre-req
        assert.equal(await token.balanceOf(keyOwner), 0)
        assert.equal(await token.balanceOf(lock.address), 0)
      })

      it('can purchase', async () => {
        // Mint some tokens for testing
        await token.mint(keyOwner, defaultBalance)

        await token.approve(lock.address, -1, { from: keyOwner })

        try {
          await lock.purchaseFor(keyOwner, { from: keyOwner, gas: 5000000 })
        } catch (e) {
          // TODO why is there an out of gas error here?!
          // Tests below show that the tx was actually successful.
          console.log(e)
        }
      })

      it('charges correct amount on purchaseKey', async () => {
        const balance = new BigNumber(await token.balanceOf(keyOwner))
        assert.equal(balance.toFixed(), defaultBalance.minus(keyPrice).toFixed())
      })

      it('transfered the tokens to the contract', async () => {
        const balance = new BigNumber(await token.balanceOf(lock.address))
        assert.equal(balance.toFixed(), keyPrice.toFixed())
      })

      it('when a key owner cancels a key, they are refunded in tokens', async () => {
        const balance = new BigNumber(await token.balanceOf(keyOwner))
        try {
          await lock.cancelAndRefund({ from: keyOwner })
        } catch (e) {
          // TODO why is there an out of gas error here?!
          // assert below shows that the tx was actually successful.
          console.log(e)
        }
        assert(balance.lt(await token.balanceOf(keyOwner)))
      })

      it('the owner can do a partial withdraw of tokens', async () => {
        const lockBalance = new BigNumber(await token.balanceOf(lock.address))
        const ownerBalance = new BigNumber(await token.balanceOf(accounts[0]))

        try {
          await lock.partialWithdraw(1)
        } catch (e) {
          // TODO why is there an out of gas error here?!
          // assert below shows that the tx was actually successful.
          console.log(e)
        }

        assert.equal(await token.balanceOf(lock.address), lockBalance.minus(1).toFixed())
        assert.equal(await token.balanceOf(accounts[0]), ownerBalance.plus(1).toFixed())
      })

      it('the owner can withdraw tokens', async () => {
        const lockBalance = new BigNumber(await token.balanceOf(lock.address))
        const ownerBalance = new BigNumber(await token.balanceOf(accounts[0]))

        try {
          await lock.withdraw()
        } catch (e) {
          // TODO why is there an out of gas error here?!
          // assert below shows that the tx was actually successful.
          console.log(e)
        }

        assert.equal(await token.balanceOf(lock.address), 0)
        assert.equal(await token.balanceOf(accounts[0]), ownerBalance.plus(lockBalance).toFixed())
      })
    })

    it('purchaseKey fails when the user does not have enough funds', async () => {
      const account = accounts[2]
      await token.approve(lock.address, -1)
      await token.mint(account, keyPrice.minus(1))
      await shouldFail(lock.purchaseFor(account, { from: account }))
    })

    it('purchaseKey fails when the user did not give the contract an allowance', async () => {
      const account = accounts[2]
      await token.approve(lock.address, -1)
      await token.mint(account, keyPrice)
      await shouldFail(lock.purchaseFor(account, { from: account }))
    })
  })

  describe('when creating a lock with an invalid ERC20', () => {
    // TODO: testing this requires using web3 instead of truffle methods
    // (truffle fails with `no code at address`)
  })

  describe('when the ERC20 is paused', () => {
    // TODO: testing this requires creating a new test-artifact with pause capabilities
  })
})
