const assert = require('assert')
const {
  deployLock,
  deployERC20,
  reverts,
  purchaseKey,
  ADDRESS_ZERO,
  increaseTimeTo,
} = require('../helpers')
const { ethers } = require('hardhat')

const keyPrice = ethers.parseUnits('0.01', 'ether')
const newPrice = ethers.parseUnits('0.011', 'ether')
const totalPrice = keyPrice * 10n
const someDai = ethers.parseUnits('100', 'ether')

let dai
let lock

describe('Lock / Extend with recurring memberships (ERC20 only)', () => {
  let lockOwner, keyOwner

  // const referrer = accounts[3]

  before(async () => {
    ;[lockOwner, keyOwner] = await ethers.getSigners()
    dai = await deployERC20(lockOwner)

    // Mint some dais for testing
    await dai.mint(await keyOwner.getAddress(), someDai)

    lock = await deployLock({ tokenAddress: await dai.getAddress() })

    // set ERC20 approval for entire scope
    await dai.connect(keyOwner).approve(await lock.getAddress(), someDai)
  })

  describe('Use extend() to restart recurring payments', () => {
    let tokenId
    beforeEach(async () => {
      // reset pricing
      await lock.updateKeyPricing(keyPrice, await dai.getAddress())
      ;({ tokenId } = await purchaseKey(
        lock,
        await keyOwner.getAddress(),
        true
      ))

      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await increaseTimeTo(expirationTs)

      // renew once
      await lock.connect(keyOwner).renewMembershipFor(tokenId, ADDRESS_ZERO)
    })

    describe('price changed', () => {
      it('should renew once key has been extended', async () => {
        // change price
        await lock.updateKeyPricing(newPrice, await dai.getAddress())

        // fails because price has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock
          .connect(keyOwner)
          .extend(newPrice, tokenId, ADDRESS_ZERO, '0x')

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)

        // renewal should work
        await increaseTimeTo(newExpirationTs - 1n)
        await lock.connect(keyOwner).renewMembershipFor(tokenId, ADDRESS_ZERO)

        const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
        const tsExpected = newExpirationTs + (await lock.expirationDuration())

        assert.equal(
          // assert results for +/- 2 sec
          tsAfter - tsExpected <= 2,
          true
        )
      })
    })

    describe('duration changed', () => {
      it('should renew once key has been extended', async () => {
        // change duration
        await lock.updateLockConfig(
          6000,
          await lock.maxNumberOfKeys(),
          await lock.maxKeysPerAddress()
        )

        // fails because price has changed
        await reverts(
          lock.connect(keyOwner).renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock
          .connect(keyOwner)
          .extend(keyPrice, tokenId, ADDRESS_ZERO, '0x')

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)

        // renewal should work
        await increaseTimeTo(newExpirationTs - 1n)
        await lock.connect(keyOwner).renewMembershipFor(tokenId, ADDRESS_ZERO)
        const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
        const tsExpected = newExpirationTs + (await lock.expirationDuration())

        assert.equal(
          // assert results for +/- 2 sec
          tsAfter - tsExpected <= 2,
          true
        )
      })
    })

    describe('token changed', () => {
      it('should renew once key has been extended', async () => {
        // deploy a new erc20 token
        const xdai = await deployERC20(await lockOwner.getAddress())
        await xdai.mint(await keyOwner.getAddress(), someDai)
        await xdai
          .connect(keyOwner)
          .approve(await lock.getAddress(), totalPrice)

        // change pricing to use new erc20
        await lock.updateKeyPricing(keyPrice, await xdai.getAddress())

        // fails because token has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock
          .connect(keyOwner)
          .extend(keyPrice, tokenId, ADDRESS_ZERO, '0x')

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await increaseTimeTo(newExpirationTs)

        // renewal should work
        await lock.connect(keyOwner).renewMembershipFor(tokenId, ADDRESS_ZERO)

        const tsExpected = newExpirationTs + (await lock.expirationDuration())
        const tsAfter = await lock.keyExpirationTimestampFor(tokenId)

        assert.equal(
          // assert results for +/- 2 sec
          tsAfter - tsExpected <= 2,
          true
        )
      })
    })
  })
})
