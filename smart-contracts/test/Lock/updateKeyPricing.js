const assert = require('assert')
const { ethers } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')
const {
  reverts,
  deployLock,
  deployERC20,
  ADDRESS_ZERO,
  compareBigNumbers,
  LOCK_MANAGER_ROLE,
} = require('../helpers')

let lock
let keyPriceBefore
let args
let token
let tokenAddressBefore
let deployer, lockCreator, lockManager, random, invalidTokenAddress

const newPrice = ethers.parseUnits('0.3', 'ether')

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
    token = await deployERC20(await deployer.getAddress())

    // Mint some tokens so that the totalSupply is greater than 0
    await token.connect(deployer).mint(await deployer.getAddress(), 1)

    lock = await deployLock({ from: await lockCreator.getAddress() })

    keyPriceBefore = await lock.keyPrice()
    tokenAddressBefore = await lock.tokenAddress()

    compareBigNumbers(keyPriceBefore, ethers.parseUnits('0.01', 'ether'))
    compareBigNumbers(tokenAddressBefore, ADDRESS_ZERO)

    const tx = await lock
      .connect(lockCreator)
      .updateKeyPricing(newPrice, await token.getAddress())

    const receipt = await tx.wait()
    ;({ args } = await getEvent(receipt, 'PricingChanged'))
  })

  it('should assign the owner to the LockManagerRole by default', async () => {
    assert.equal(await lock.isLockManager(await lockCreator.getAddress()), true)
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
    assert.equal(await lock.isLockManager(await random.getAddress()), false)
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
      assert.equal(
        await lock.isLockManager(await lockCreator.getAddress()),
        true
      )
      await lock
        .connect(lockCreator)
        .updateKeyPricing(await lock.keyPrice(), await token.getAddress())
      assert.equal(await lock.tokenAddress(), await token.getAddress())
    })

    it('should allow a LockManager to switch from erc20 => eth', async () => {
      await lock
        .connect(lockCreator)
        .updateKeyPricing(await lock.keyPrice(), ADDRESS_ZERO)
      assert.equal(await lock.tokenAddress(), 0)
    })

    it('should allow a lock manager who is not the owner to make changes', async () => {
      await lock
        .connect(lockCreator)
        .grantRole(LOCK_MANAGER_ROLE, await lockManager.getAddress())
      assert.notEqual(
        await lockManager.getAddress(),
        await lockCreator.getAddress()
      )
      assert.equal(
        await lock.isLockManager(await lockManager.getAddress()),
        true
      )

      await lock
        .connect(lockManager)
        .updateKeyPricing(
          ethers.parseUnits('0.42', 'ether'),
          await token.getAddress()
        )
      assert.equal(await lock.tokenAddress(), await token.getAddress())
      compareBigNumbers(
        await lock.keyPrice(),
        ethers.parseUnits('0.42', 'ether')
      )
    })

    it('should allow a lockManager to renounce their role', async () => {
      await lock
        .connect(lockManager)
        .renounceRole(LOCK_MANAGER_ROLE, await lockManager.getAddress())
      assert.equal(
        await lock.isLockManager(await lockManager.getAddress()),
        false
      )
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
