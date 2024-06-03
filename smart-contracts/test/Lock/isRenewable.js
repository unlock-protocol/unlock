const assert = require('assert')
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

const keyPrice = ethers.parseUnits('0.01', 'ether')
const totalPrice = keyPrice * 10n
const someDai = ethers.parseUnits('10', 'ether')

describe('Lock / isRenewable (ERC20 only)', () => {
  let tokenId
  let deployer, keyOwner

  before(async () => {
    ;[deployer, keyOwner] = await ethers.getSigners()
    dai = await deployERC20(await deployer.getAddress())

    // Mint some dais for testing
    await dai.mint(await keyOwner.getAddress(), someDai)

    lock = await deployLock({ tokenAddress: await dai.getAddress() })

    // set ERC20 approval for entire scope
    await dai.connect(keyOwner).approve(await lock.getAddress(), totalPrice)
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress(), true))

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
        ethers.parseUnits('0.009', 'ether'),
        await dai.getAddress()
      )
      assert.equal(await lock.isRenewable(tokenId, ADDRESS_ZERO), true)
    })
    it('if time has increased', async () => {
      const increasedDuration = (await lock.expirationDuration()) + 1000n
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
      const { tokenId } = await purchaseKey(
        noERC20lock,
        await keyOwner.getAddress()
      )
      await reverts(
        noERC20lock.isRenewable(tokenId, ADDRESS_ZERO),
        'NON_RENEWABLE_LOCK'
      )
    })
    it('reverts if lock has infinite duration', async () => {
      const infiniteLock = await deployLock({
        name: 'NON_EXPIRING',
        tokenAddress: await dai.getAddress(),
      })
      await dai
        .connect(keyOwner)
        .approve(await infiniteLock.getAddress(), keyPrice)
      const { tokenId } = await purchaseKey(
        infiniteLock,
        await keyOwner.getAddress(),
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
      const { tokenId } = await purchaseKey(
        lock,
        await keyOwner.getAddress(),
        true
      )
      await reverts(
        lock.isRenewable(tokenId, ADDRESS_ZERO),
        'NOT_READY_FOR_RENEWAL'
      )

      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      const lockDuration = await lock.expirationDuration()

      const notCloseEnough =
        expirationTs - lockDuration + (lockDuration * 89n) / 100n
      await increaseTimeTo(notCloseEnough)
      await reverts(
        lock.isRenewable(tokenId, ADDRESS_ZERO),
        'NOT_READY_FOR_RENEWAL'
      )
    })
    it('return true if key is close to expiration (90%)', async () => {
      const { tokenId } = await purchaseKey(
        lock,
        await keyOwner.getAddress(),
        true
      )

      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      const lockDuration = await lock.expirationDuration()

      const ninetyPercent =
        expirationTs - lockDuration + (lockDuration * 90n) / 100n
      await increaseTimeTo(ninetyPercent)

      assert.equal(await lock.isRenewable(tokenId, ADDRESS_ZERO), true)
    })
  })

  describe('change in lock settings', () => {
    it('reverts if price has increased', async () => {
      await lock.updateKeyPricing(
        ethers.parseUnits('0.3', 'ether'),
        await dai.getAddress()
      )
      await reverts(lock.isRenewable(tokenId, ADDRESS_ZERO), 'LOCK_HAS_CHANGED')
    })

    it('reverts if erc20 token has changed', async () => {
      // deploy another token
      const dai2 = await deployERC20(await deployer.getAddress())
      await dai2.mint(await keyOwner.getAddress(), someDai)

      // update lock token without changing price
      await lock.updateKeyPricing(keyPrice, await dai2.getAddress())
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
