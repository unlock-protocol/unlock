const { assert } = require('chai')
const {
  deployERC20,
  purchaseKey,
  deployLock,
  ADDRESS_ZERO,
  reverts,
  increaseTimeTo,
} = require('../helpers')
const { ethers } = require('hardhat')

let lock

let dai

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const totalPrice = keyPrice.mul(10)
const someDai = ethers.utils.parseUnits('10', 'ether')

describe('Lock / isRenewable (ERC20 only)', () => {
  let tokenId
  let deployer, keyOwner

  before(async () => {
    ;[deployer, keyOwner] = await ethers.getSigners()
    dai = await deployERC20(deployer.address)

    // Mint some dais for testing
    await dai.mint(keyOwner.address, someDai)

    lock = await deployLock({ tokenAddress: dai.address })

    // set ERC20 approval for entire scope
    await dai.connect(keyOwner).approve(lock.address, totalPrice)
    ;({ tokenId } = await purchaseKey(lock, keyOwner.address, true))

    // expire the key
    const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
    await increaseTimeTo(expirationTs)
  })

  describe('return true', () => {
    it('if terms havent changed', async () => {
      assert.equal(await lock.isRenewable(tokenId, ADDRESS_ZERO), true)
    })
    it('if price has decreased', async () => {
      await lock.updateKeyPricing(
        ethers.utils.parseUnits('0.009', 'ether'),
        dai.address
      )
      assert.equal(await lock.isRenewable(tokenId, ADDRESS_ZERO), true)
    })
    it('if time has increased', async () => {
      const increasedDuration =
        (await lock.expirationDuration()).toNumber() + 1000
      await lock.updateLockConfig(
        increasedDuration,
        await lock.maxNumberOfKeys(),
        await lock.maxKeysPerAddress()
      )
      assert.equal(await lock.isRenewable(tokenId, ADDRESS_ZERO), true)
    })
  })

  describe('uncorrect lock settings', () => {
    it('reverts if lock isnt erc20', async () => {
      const noERC20lock = await deployLock()
      const { tokenId } = await purchaseKey(noERC20lock, keyOwner.address)
      await reverts(
        noERC20lock.isRenewable(tokenId, ADDRESS_ZERO),
        'NON_RENEWABLE_LOCK'
      )
    })
    it('reverts if lock has infinite duration', async () => {
      const infiniteLock = await deployLock({
        name: 'NON_EXPIRING',
        tokenAddress: dai.address,
      })
      await dai.connect(keyOwner).approve(infiniteLock.address, keyPrice)
      const { tokenId } = await purchaseKey(
        infiniteLock,
        keyOwner.address,
        true
      )
      await reverts(
        infiniteLock.isRenewable(tokenId, ADDRESS_ZERO),
        'NON_RENEWABLE_LOCK'
      )
    })
  })

  describe('key readiness', () => {
    it('reverts if key isnt close to expiration', async () => {
      const { tokenId } = await purchaseKey(lock, keyOwner.address, true)
      await reverts(
        lock.isRenewable(tokenId, ADDRESS_ZERO),
        'NOT_READY_FOR_RENEWAL'
      )

      const expirationTs = (
        await lock.keyExpirationTimestampFor(tokenId)
      ).toNumber()
      const lockDuration = (await lock.expirationDuration()).toNumber()
      const notCloseEnough = expirationTs - lockDuration + lockDuration * 0.89
      await increaseTimeTo(notCloseEnough)
      await reverts(
        lock.isRenewable(tokenId, ADDRESS_ZERO),
        'NOT_READY_FOR_RENEWAL'
      )
    })
    it('return true if key is close to expiration (90%)', async () => {
      const { tokenId } = await purchaseKey(lock, keyOwner.address, true)

      const expirationTs = (
        await lock.keyExpirationTimestampFor(tokenId)
      ).toNumber()
      const lockDuration = (await lock.expirationDuration()).toNumber()

      const ninetyPercent = expirationTs - lockDuration + lockDuration * 0.9
      await increaseTimeTo(ninetyPercent)

      assert.equal(await lock.isRenewable(tokenId, ADDRESS_ZERO), true)
    })
  })

  describe('change in lock settings', () => {
    it('reverts if price has increased', async () => {
      await lock.updateKeyPricing(
        ethers.utils.parseUnits('0.3', 'ether'),
        dai.address
      )
      await reverts(lock.isRenewable(tokenId, ADDRESS_ZERO), 'LOCK_HAS_CHANGED')
    })

    it('reverts if erc20 token has changed', async () => {
      // deploy another token
      const dai2 = await deployERC20(deployer.address)
      await dai2.mint(keyOwner.address, someDai)

      // update lock token without changing price
      await lock.updateKeyPricing(keyPrice, dai2.address)
      await reverts(lock.isRenewable(tokenId, ADDRESS_ZERO), 'LOCK_HAS_CHANGED')
    })

    it('reverts if duration has changed', async () => {
      await lock.updateLockConfig(
        1000,
        await lock.maxNumberOfKeys(),
        await lock.maxKeysPerAddress()
      )
      await reverts(lock.isRenewable(tokenId, ADDRESS_ZERO), 'LOCK_HAS_CHANGED')
    })
  })
})
