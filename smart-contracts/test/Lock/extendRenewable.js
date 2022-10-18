const {
  deployLock,
  deployERC20,
  reverts,
  purchaseKey,
  ADDRESS_ZERO,
} = require('../helpers')
const { time } = require('@openzeppelin/test-helpers')
const { ethers } = require('hardhat')

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const newPrice = ethers.utils.parseUnits('0.011', 'ether')
const totalPrice = keyPrice.mul(10).toString()
const someDai = ethers.utils.parseUnits('100', 'ether')

let dai
let lock

contract('Lock / Extend with recurring memberships', (accounts) => {
  const lockOwner = accounts[0]
  const keyOwner = accounts[1]
  // const referrer = accounts[3]

  before(async () => {
    dai = await deployERC20(lockOwner)

    // Mint some dais for testing
    await dai.mint(keyOwner, someDai, {
      from: lockOwner,
    })

    lock = await deployLock({ tokenAddress: dai.address })

    // set ERC20 approval for entire scope
    await dai.approve(lock.address, someDai, {
      from: keyOwner,
    })
  })

  describe('Use extend() to restart recurring payments', () => {
    let tokenId
    beforeEach(async () => {
      // reset pricing
      await lock.updateKeyPricing(keyPrice, dai.address, { from: lockOwner })
      ;({ tokenId } = await purchaseKey(lock, keyOwner, true))

      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await time.increaseTo(expirationTs.toNumber())

      // renew once
      await lock.renewMembershipFor(tokenId, ADDRESS_ZERO, {
        from: keyOwner,
      })
    })

    describe('price changed', () => {
      it('should renew once key has been extended', async () => {
        // change price
        await lock.updateKeyPricing(newPrice, dai.address, { from: lockOwner })

        // fails because price has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock.extend(newPrice, tokenId, ADDRESS_ZERO, [], {
          from: keyOwner,
        })

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)

        // renewal should work
        await time.increaseTo(newExpirationTs.toNumber() - 1)
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO, {
          from: keyOwner,
        })

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
          await lock.maxKeysPerAddress(),
          { from: lockOwner }
        )

        // fails because price has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock.extend(keyPrice, tokenId, ADDRESS_ZERO, [], {
          from: keyOwner,
        })

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)

        // renewal should work
        await time.increaseTo(newExpirationTs.toNumber() - 1)
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO, {
          from: keyOwner,
        })
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
        const xdai = await deployERC20(lockOwner)
        await xdai.mint(keyOwner, someDai, {
          from: lockOwner,
        })
        await xdai.approve(lock.address, totalPrice, {
          from: keyOwner,
        })

        // change pricing to use new erc20
        await lock.updateKeyPricing(keyPrice, xdai.address, { from: lockOwner })

        // fails because token has changed
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )

        // user extend key
        await lock.extend(keyPrice, tokenId, ADDRESS_ZERO, [], {
          from: keyOwner,
        })

        // expire key again
        const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await time.increaseTo(newExpirationTs.toNumber())

        // renewal should work
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO, {
          from: keyOwner,
        })

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
