const { assert } = require('chai')
const {
  deployERC20,
  reverts,
  purchaseKey,
  ADDRESS_ZERO,
  deployLock,
  increaseTimeTo,
} = require('../helpers')
const { ethers } = require('hardhat')

let lock
let dai

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const totalPrice = keyPrice.mul(10)
const someDai = ethers.utils.parseUnits('10', 'ether')

describe('Lock / Recurring memberships', () => {
  let lockOwner
  let keyOwner
  let randomSigner

  beforeEach(async () => {
    ;[lockOwner, keyOwner, randomSigner] = await ethers.getSigners()
    dai = await deployERC20(lockOwner.address, true)

    // Mint some dais for testing
    await dai.mint(keyOwner.address, someDai)

    lock = await deployLock({ tokenAddress: dai.address, isEthers: true })

    // set ERC20 approval for entire scope
    await dai.connect(keyOwner).approve(lock.address, totalPrice)
  })

  describe('erc20 status', () => {
    it('address is set correctly in lock', async () => {
      assert.equal(await lock.tokenAddress(), dai.address)
    })
    it('approval should be set correctly', async () => {
      assert.equal(
        (await dai.allowance(keyOwner.address, lock.address)).toString(),
        totalPrice.toString()
      )
    })
    it('balance should be enough', async () => {
      assert.equal(
        (await dai.balanceOf(keyOwner.address)).toString(),
        someDai.toString()
      )
    })
  })

  describe('renewMembershipFor', () => {
    describe('fails with wrong lock settings', async () => {
      it('can not renew non-expiring keys', async () => {
        const lockNonExpiring = await deployLock({
          tokenAddress: dai.address,
          name: 'NON_EXPIRING',
          isEthers: true,
        })
        await dai.connect(keyOwner).approve(lockNonExpiring.address, totalPrice)
        const { tokenId: newTokenId } = await purchaseKey(
          lockNonExpiring,
          keyOwner.address,
          true
        )
        await reverts(
          lockNonExpiring.renewMembershipFor(newTokenId, ADDRESS_ZERO),
          'NON_RENEWABLE_LOCK'
        )
      })

      it('can not renew lock with no ERC20 tokens set', async () => {
        // remove dai token
        await lock.updateKeyPricing(keyPrice, ADDRESS_ZERO)
        assert.equal(await lock.totalKeys(keyOwner.address), 1)
        const { tokenId: newTokenId } = await purchaseKey(
          lock,
          keyOwner.address
        )
        assert.equal(await lock.totalKeys(keyOwner.address), 2)
        await reverts(
          lock.renewMembershipFor(newTokenId, ADDRESS_ZERO),
          'NON_RENEWABLE_LOCK'
        )
      })
    })

    describe('fails when key is not correct', () => {
      it('should revert if key doesnt exist', async () => {
        await reverts(lock.renewMembershipFor(321, ADDRESS_ZERO), 'NO_SUCH_KEY')
      })

      it('reverts if key is valid', async () => {
        await dai.mint(randomSigner.address, someDai)
        await dai.connect(randomSigner).approve(lock.address, totalPrice)

        const { tokenId: newTokenId } = await purchaseKey(
          lock,
          randomSigner.address,
          true
        )
        assert.equal(await lock.isValidKey(newTokenId), true)
        await reverts(
          lock.renewMembershipFor(newTokenId, ADDRESS_ZERO),
          'NOT_READY'
        )
      })
    })

    let tokenId
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address, true))
      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await increaseTimeTo(expirationTs)
    })

    describe('fails when lock settings have changed', () => {
      it('should revert if price has changed', async () => {
        await lock.updateKeyPricing(
          ethers.utils.parseUnits('0.3', 'ether'),
          dai.address
        )
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })

      it('should revert if erc20 token has changed', async () => {
        // deploy another token
        const dai2 = await deployERC20(randomSigner, true)
        await dai2.connect(randomSigner).mint(keyOwner.address, someDai)
        // update lock token without changing price
        await lock.updateKeyPricing(keyPrice, dai2.address)
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })

      it('should revert if duration has changed', async () => {
        await lock.updateLockConfig(
          1000,
          await lock.maxNumberOfKeys(),
          await lock.maxKeysPerAddress()
        )
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })
    })

    describe('correctly transfer tokens', () => {
      it('should take from user balance', async () => {
        const balanceBefore = await dai.balanceOf(keyOwner.address)
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const balanceAfter = await dai.balanceOf(keyOwner.address)
        assert.equal(
          balanceBefore.sub(keyPrice.toString()).toString(),
          balanceAfter.toString()
        )
      })

      it('transferred the tokens to the contract', async () => {
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const balance = await dai.balanceOf(lock.address)
        assert.equal(balance.toString(), keyPrice.mul(2).toString())
      })
    })

    it('should emit a KeyRenewed event', async () => {
      const tx = await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
      const { events } = await tx.wait()
      const { args } = events.find((v) => v.event === 'KeyExtended')
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
      assert.equal(args.newTimestamp.toNumber(), tsAfter.toNumber())
    })

    describe('erc20 balance / approval issues', () => {
      it('should revert if approval is too low', async () => {
        // reduce approval
        await dai.connect(keyOwner).approve(lock.address, keyPrice)

        assert.equal(
          (await dai.allowance(keyOwner.address, lock.address)).toString(),
          keyPrice.toString()
        )

        // renew membership once
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)

        // no allowance left
        assert.equal(
          (await dai.allowance(keyOwner.address, lock.address)).toString(),
          '0'
        )
        const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await increaseTimeTo(expirationTs)
        // now reverts
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'ERC20: insufficient allowance'
        )
      })

      it('should revert if the ERC20 balance is not enough', async () => {
        // renew membership once
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)

        // empty the account
        const balanceBefore = await dai.balanceOf(keyOwner.address)
        await dai.connect(keyOwner).approve(keyOwner.address, balanceBefore)
        await dai
          .connect(keyOwner)
          .transferFrom(keyOwner.address, randomSigner.address, balanceBefore)
        assert.equal((await dai.balanceOf(keyOwner.address)).toString(), '0')

        //
        const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await increaseTimeTo(expirationTs)

        // now funds are not enough
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'ERC20: transfer amount exceeds balance'
        )
      })
    })

    describe('cancel or expire membership', () => {
      it('reverts after transferFrom', async () => {
        // make sure key is valid
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        // transfer
        await lock
          .connect(keyOwner)
          .transferFrom(keyOwner.address, randomSigner.address, tokenId)
        // should fail
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })

      it('reverts after a expireAndRefund', async () => {
        // renew once
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const balanceBefore = await dai.balanceOf(keyOwner.address)
        const allowanceBefore = await dai.allowance(
          keyOwner.address,
          lock.address
        )
        const tx = await lock.expireAndRefundFor(tokenId, keyPrice)
        const { events } = await tx.wait()

        const {
          args: { refund },
        } = events.find(({ event }) => event === 'CancelKey')
        assert.equal(refund.toString(), keyPrice.toString())

        // refund ok
        assert.equal(
          (await dai.balanceOf(keyOwner.address)).toString(),
          balanceBefore.add(keyPrice.toString()).toString()
        )

        // key expired
        assert.equal(await lock.getHasValidKey(keyOwner.address), false)
        assert.equal(await lock.isValidKey(tokenId), false)

        // ERC20 allowance has not been cancelled
        assert.equal(
          allowanceBefore.toString(),
          (await dai.allowance(keyOwner.address, lock.address)).toString()
        )

        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })
    })

    /*
    describe('should grant UDT to referrer', async () => {
      it('referrer has no UDT to start', async () => {
        const actual = new BigNumber(await udt.balanceOf(referrer))
        assert.equal(actual.toString(), 0)
      })

      it('referrer has some UDT now', async () => {
        await lock.renewMembershipFor(tokenId, referrer)
        const actual = new BigNumber(await udt.balanceOf(referrer))
        assert.equal(actual.toString(), 10)
      })
    })
    */

    it('should call onPurchase if set', async () => {
      // set hook
      const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
      const testEventHooks = await TestEventHooks.deploy()
      await lock.setEventHooks(
        testEventHooks.address,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO
      )
      await reverts(
        lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
        'PURCHASE_BLOCKED_BY_HOOK'
      )
    })
  })
})
