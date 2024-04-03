const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  reverts,
  deployLock,
  deployERC20,
  ADDRESS_ZERO,
  compareBigNumbers,
} = require('../helpers')

let lock
let keyPriceBefore
let args
let token
let tokenAddressBefore
let deployer, lockCreator, lockManager, random, invalidTokenAddress

const newPrice = ethers.utils.parseUnits('0.3', 'ether')

describe('Lock / updateKeyPricing', () => {
  before(async () => {
    ;[
      ,
      deployer,
      lockCreator,
      lockManager,
      random,
      { address: invalidTokenAddress },
    ] = await ethers.getSigners()
    token = await deployERC20(deployer.address)

    // Mint some tokens so that the totalSupply is greater than 0
    await token.connect(deployer).mint(deployer.address, 1)

    lock = await deployLock({ from: lockCreator.address })

    keyPriceBefore = await lock.keyPrice()
    tokenAddressBefore = await lock.tokenAddress()

    compareBigNumbers(keyPriceBefore, ethers.utils.parseUnits('0.01', 'ether'))
    compareBigNumbers(tokenAddressBefore, ADDRESS_ZERO)

    const tx = await lock
      .connect(lockCreator)
      .updateKeyPricing(newPrice, token.address)

    const { events } = await tx.wait()
    ;({ args } = events.find(({ event }) => event === 'PricingChanged'))
  })

  it('should assign the owner to the LockManagerRole by default', async () => {
    assert.equal(await lock.isLockManager(lockCreator.address), true)
  })

  it('should change the actual keyPrice', async () => {
    compareBigNumbers(await lock.keyPrice(), newPrice)
  })

  it('should trigger an event', () => {
    compareBigNumbers(args.keyPrice, newPrice)
  })

  it('should allow changing price to 0', async () => {
    await lock
      .connect(lockCreator)
      .updateKeyPricing(0, await lock.tokenAddress())
    compareBigNumbers(await lock.keyPrice(), 0)
  })

  it('fails when the sender does not have the LockManager role', async () => {
    assert.equal(await lock.isLockManager(random.address), false)
    await reverts(
      lock
        .connect(random)
        .updateKeyPricing(newPrice, await lock.tokenAddress()),
      ''
    )
  })

  describe('changing the token address', () => {
    it('should allow a LockManager to switch from eth => erc20', async () => {
      assert.equal(tokenAddressBefore, 0)
      assert.equal(await lock.isLockManager(lockCreator.address), true)
      await lock
        .connect(lockCreator)
        .updateKeyPricing(await lock.keyPrice(), token.address)
      assert.equal(await lock.tokenAddress(), token.address)
    })

    it('should allow a LockManager to switch from erc20 => eth', async () => {
      await lock
        .connect(lockCreator)
        .updateKeyPricing(await lock.keyPrice(), ADDRESS_ZERO)
      assert.equal(await lock.tokenAddress(), 0)
    })

    it('should allow a lock manager who is not the owner to make changes', async () => {
      await lock.connect(lockCreator).addLockManager(lockManager.address)
      assert.notEqual(lockManager.address, lockCreator.address)
      assert.equal(await lock.isLockManager(lockManager.address), true)

      await lock
        .connect(lockManager)
        .updateKeyPricing(
          ethers.utils.parseUnits('0.42', 'ether'),
          token.address
        )
      assert.equal(await lock.tokenAddress(), token.address)
      compareBigNumbers(
        await lock.keyPrice(),
        ethers.utils.parseUnits('0.42', 'ether')
      )
    })

    it('should allow a lockManager to renounce their role', async () => {
      await lock.connect(lockManager).renounceLockManager()
      assert.equal(await lock.isLockManager(lockManager.address), false)
    })

    it('should revert if trying to switch to an invalid token address', async () => {
      await reverts(
        lock
          .connect(lockCreator)
          .updateKeyPricing(await lock.keyPrice(), invalidTokenAddress)
      )
    })
  })
})
