const { assert } = require('chai')
const {
  deployLock,
  deployERC20,
  reverts,
  purchaseKey,
  ADDRESS_ZERO,
  increaseTimeTo,
} = require('../helpers')
const { ethers } = require('hardhat')

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const newPrice = ethers.utils.parseUnits('0.011', 'ether')
const totalPrice = keyPrice.mul(10).toString()
const someDai = ethers.utils.parseUnits('100', 'ether')

let dai
let lock

describe('Lock / Extend with recurring memberships (ERC20 only)', () => {
  let lockOwner, keyOwner

  // const referrer = accounts[3]

  before(async () => {
    ;[lockOwner, keyOwner] = await ethers.getSigners()
    dai = await deployERC20(lockOwner)

    // Mint some dais for testing
    await dai.mint(keyOwner.address, someDai)

    lock = await deployLock({ tokenAddress: dai.address })

    // set ERC20 approval for entire scope
    await dai.connect(keyOwner).approve(lock.address, someDai)
  })

  describe('Use extend() to restart recurring payments', () => {
    let tokenId
    beforeEach(async () => {
      // reset pricing
      await lock.updateKeyPricing(keyPrice, dai.address)
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address, true))

      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await increaseTimeTo(expirationTs)

      // renew once
      await lock.connect(keyOwner).renewMembershipFor(tokenId, ADDRESS_ZERO)
    })

    describe('price changed', () => {
      it('should renew once key has been extended', async () => {
        // change price
        await lock.updateKeyPricing(newPrice, dai.address)

        // fails because price has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock.connect(keyOwner).extend(newPrice, tokenId, ADDRESS_ZERO, [])

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)

        // renewal should work
        await increaseTimeTo(newExpirationTs.toNumber() - 1)
        await lock.connect(keyOwner).renewMembershipFor(tokenId, ADDRESS_ZERO)

        const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
        const tsExpected = newExpirationTs.add(await lock.expirationDuration())

        assert.equal(
          // assert results for +/- 2 sec
          tsAfter.toNumber() - tsExpected.toNumber() <= 2,
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
        await lock.connect(keyOwner).extend(keyPrice, tokenId, ADDRESS_ZERO, [])

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)

        // renewal should work
        await increaseTimeTo(newExpirationTs.toNumber() - 1)
        await lock.connect(keyOwner).renewMembershipFor(tokenId, ADDRESS_ZERO)
        const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
        const tsExpected = newExpirationTs.add(await lock.expirationDuration())

        assert.equal(
          // assert results for +/- 2 sec
          tsAfter.toNumber() - tsExpected.toNumber() <= 2,
          true
        )
      })
    })

    describe('token changed', () => {
      it('should renew once key has been extended', async () => {
        // deploy a new erc20 token
        const xdai = await deployERC20(lockOwner.address)
        await xdai.mint(keyOwner.address, someDai)
        await xdai.connect(keyOwner).approve(lock.address, totalPrice)

        // change pricing to use new erc20
        await lock.updateKeyPricing(keyPrice, xdai.address)

        // fails because token has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock.connect(keyOwner).extend(keyPrice, tokenId, ADDRESS_ZERO, [])

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await increaseTimeTo(newExpirationTs.toNumber())

        // renewal should work
        await lock.connect(keyOwner).renewMembershipFor(tokenId, ADDRESS_ZERO)

        const tsExpected = newExpirationTs.add(await lock.expirationDuration())
        const tsAfter = await lock.keyExpirationTimestampFor(tokenId)

        assert.equal(
          // assert results for +/- 2 sec
          tsAfter.toNumber() - tsExpected.toNumber() <= 2,
          true
        )
      })
    })
  })
})
