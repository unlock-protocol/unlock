const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const Web3Utils = require('web3-utils')
const truffleAssert = require('truffle-assertions')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const TestErc20Token = artifacts.require('TestErc20Token.sol')
const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let locks
let lock
let keyPriceBefore
let tokenAddressBefore
let transaction
let token
let lockOwner
let invalidTokenAddress

contract('Lock / updateKeyPricing', accounts => {
  invalidTokenAddress = accounts[9]
  lockOwner = accounts[0]

  before(async () => {
    token = await TestErc20Token.new()
    // Mint some tokens so that the totalSupply is greater than 0
    await token.mint(accounts[0], 1)
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    keyPriceBefore = new BigNumber(await lock.keyPrice.call())
    tokenAddressBefore = await lock.tokenAddress.call()
    assert.equal(keyPriceBefore.toFixed(), 10000000000000000)
    transaction = await lock.updateKeyPricing(
      Units.convert('0.3', 'eth', 'wei'),
      token.address
    )
  })

  it('should change the actual keyPrice', async () => {
    const keyPriceAfter = new BigNumber(await lock.keyPrice.call())
    assert.equal(keyPriceAfter.toFixed(), 300000000000000000)
  })

  it('should trigger an event', () => {
    const event = transaction.logs.find(log => {
      return log.event === 'PricingChanged'
    })
    assert(event)
    assert.equal(
      new BigNumber(event.args.keyPrice).toFixed(),
      300000000000000000
    )
  })

  it('should allow changing price to 0', async () => {
    await lock.updateKeyPricing(0, await lock.tokenAddress.call())
    const keyPriceAfter = new BigNumber(await lock.keyPrice.call())
    assert.equal(keyPriceAfter.toFixed(), 0)
  })

  describe('when the sender does not have the LockManager role', () => {
    let keyPrice

    before(async () => {
      keyPrice = new BigNumber(await lock.keyPrice.call())
      await shouldFail(
        lock.updateKeyPricing(
          Units.convert('0.3', 'eth', 'wei'),
          await lock.tokenAddress.call(),
          {
            from: accounts[3],
          }
        ),
        ''
      )
    })

    it('should leave the price unchanged', async () => {
      const keyPriceAfter = new BigNumber(await lock.keyPrice.call())
      assert.equal(keyPrice.toFixed(), keyPriceAfter.toFixed())
    })
  })

  describe('changing the token address', () => {
    it('should allow a LockManager to switch from eth => erc20', async () => {
      assert.equal(tokenAddressBefore, 0)
      await lock.updateKeyPricing(await lock.keyPrice.call(), token.address, {
        from: lockOwner,
      })
      let tokenAddressAfter = await lock.tokenAddress.call()
      assert.equal(tokenAddressAfter, token.address)
    })

    it('should allow a LockManager to switch from erc20 => eth', async () => {
      await lock.updateKeyPricing(
        await lock.keyPrice.call(),
        Web3Utils.padLeft(0, 40)
      )
      assert.equal(await lock.tokenAddress.call(), 0)
    })

    it('should revert if trying to switch to an invalid token address', async () => {
      await truffleAssert.fails(
        lock.updateKeyPricing(await lock.keyPrice.call(), invalidTokenAddress, {
          from: lockOwner,
        }),
        truffleAssert.ErrorType.REVERT
      )
    })
  })
})
