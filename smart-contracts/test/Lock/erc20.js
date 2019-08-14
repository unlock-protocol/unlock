const BigNumber = require('bignumber.js')

const unlockContract = artifacts.require('Unlock.sol')
const TestErc20Token = artifacts.require('TestErc20Token.sol')
const TestNoop = artifacts.require('TestNoop.sol')
const getProxy = require('../helpers/proxy')
const shouldFail = require('../helpers/shouldFail')
const deployLocks = require('../helpers/deployLocks')
const LockApi = require('../helpers/lockApi')

contract('Lock / erc20', accounts => {
  let unlock, token, lock, lockApi

  before(async () => {
    token = await TestErc20Token.new()
    // Mint some tokens so that the totalSupply is greater than 0
    await token.mint(accounts[0], 1)
    unlock = await getProxy(unlockContract)
    const locks = await deployLocks(unlock, accounts[0], token.address)
    lock = locks['FIRST']
    lockApi = new LockApi(lock)
  })

  describe('creating ERC20 priced locks', () => {
    let keyPrice
    const keyOwner = accounts[1]
    const keyOwner2 = accounts[2]
    const defaultBalance = new BigNumber(100000000000000000)

    before(async () => {
      // Pre-req
      assert.equal(await token.balanceOf(keyOwner), 0)
      assert.equal(await token.balanceOf(lock.address), 0)

      // Mint some tokens for testing
      await token.mint(keyOwner, defaultBalance)
      await token.mint(keyOwner2, defaultBalance)

      // Approve the lock to make transfers
      await token.approve(lock.address, -1, { from: keyOwner })
      await token.approve(lock.address, -1, { from: keyOwner2 })

      keyPrice = new BigNumber(await lock.keyPrice.call())
    })

    describe('users can purchase keys', () => {
      it('can purchase', async () => {
        await lockApi.purchase(keyOwner, web3.utils.padLeft(0, 40))
      })

      it('charges correct amount on purchaseKey', async () => {
        const balance = new BigNumber(await token.balanceOf(keyOwner))
        assert.equal(
          balance.toFixed(),
          defaultBalance.minus(keyPrice).toFixed()
        )
      })

      it('transfered the tokens to the contract', async () => {
        const balance = new BigNumber(await token.balanceOf(lock.address))
        assert.equal(balance.toFixed(), keyPrice.toFixed())
      })

      it('when a key owner cancels a key, they are refunded in tokens', async () => {
        const balance = new BigNumber(await token.balanceOf(keyOwner))
        await lockApi.cancelAndRefund(keyOwner)
        assert(balance.lt(await token.balanceOf(keyOwner)))
      })

      it('the owner can withdraw tokens', async () => {
        const lockBalance = new BigNumber(await token.balanceOf(lock.address))
        const ownerBalance = new BigNumber(await token.balanceOf(accounts[0]))

        await lockApi.withdraw(await lock.tokenAddress.call(), 0, accounts[0])

        assert.equal(await token.balanceOf(lock.address), 0)
        assert.equal(
          await token.balanceOf(accounts[0]),
          ownerBalance.plus(lockBalance).toFixed()
        )
      })

      it('purchaseForFrom works as well', async () => {
        // The referrer needs a valid key for this test
        await lockApi.purchase(keyOwner, web3.utils.padLeft(0, 40))
        const balanceBefore = new BigNumber(await token.balanceOf(keyOwner2))

        await lockApi.purchase(keyOwner2, keyOwner)

        const balance = new BigNumber(await token.balanceOf(keyOwner2))
        assert.equal(balance.toFixed(), balanceBefore.minus(keyPrice).toFixed())
      })

      it('can transfer the key to another user', async () => {
        await lock.transferFrom(
          accounts[2],
          accounts[4],
          await lock.getTokenIdFor.call(accounts[2]),
          {
            from: accounts[2],
          }
        )
      })
    })

    it('purchaseKey fails when the user does not have enough funds', async () => {
      const account = accounts[3]
      await token.approve(lock.address, -1)
      await token.mint(account, keyPrice.minus(1))
      await shouldFail(
        lock.purchase(account, web3.utils.padLeft(0, 40), [], { from: account })
      )
    })

    it('purchaseKey fails when the user did not give the contract an allowance', async () => {
      const account = accounts[4]
      await token.approve(lock.address, -1)
      await token.mint(account, keyPrice)
      await shouldFail(
        lock.purchase(account, web3.utils.padLeft(0, 40), [], { from: account })
      )
    })
  })

  describe('should fail to create a lock when', () => {
    it('when creating a lock for a contract which is not an ERC20', async () => {
      await shouldFail(
        deployLocks(unlock, accounts[0], (await TestNoop.new()).address)
      )
    })

    describe('when creating a lock with an invalid ERC20', () => {
      // TODO: testing this requires using web3 instead of truffle methods
      // (truffle fails with `no code at address`)
    })
  })

  describe('when the ERC20 is paused', () => {
    // TODO: testing this requires creating a new test-artifact with pause capabilities
  })
})
