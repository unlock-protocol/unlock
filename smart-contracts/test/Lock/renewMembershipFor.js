const BigNumber = require('bignumber.js')
const { time } = require('@openzeppelin/test-helpers')
const { assert } = require('chai')
const {
  deployERC20,
  reverts,
  purchaseKey,
  ADDRESS_ZERO,
  deployLock,
} = require('../helpers')
const { ethers } = require('hardhat')

const TestEventHooks = artifacts.require('TestEventHooks.sol')

let lock

let dai

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const totalPrice = keyPrice.mul(10)
const someDai = ethers.utils.parseUnits('10', 'ether')

contract('Lock / Recurring memberships', (accounts) => {
  const lockOwner = accounts[0]
  const keyOwner = accounts[1]
  // const referrer = accounts[3]

  beforeEach(async () => {
    dai = await deployERC20(lockOwner)

    // Mint some dais for testing
    await dai.mint(keyOwner, someDai, {
      from: lockOwner,
    })

    lock = await deployLock({ tokenAddress: dai.address })

    // set ERC20 approval for entire scope
    await dai.approve(lock.address, totalPrice, {
      from: keyOwner,
    })
  })

  describe('erc20 status', () => {
    it('address is set correctly in lock', async () => {
      assert.equal(await lock.tokenAddress(), dai.address)
    })
    it('approval should be set correctly', async () => {
      assert.equal(
        new BigNumber(await dai.allowance(keyOwner, lock.address)).toString(),
        totalPrice.toString()
      )
    })
    it('balance should be enough', async () => {
      assert.equal(
        new BigNumber(await dai.balanceOf(keyOwner)).toString(),
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
        })
        await dai.approve(lockNonExpiring.address, totalPrice, {
          from: keyOwner,
        })
        const { tokenId: newTokenId } = await purchaseKey(
          lockNonExpiring,
          keyOwner,
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
        assert.equal(await lock.totalKeys(keyOwner), 1)
        const { tokenId: newTokenId } = await purchaseKey(lock, keyOwner)
        assert.equal(await lock.totalKeys(keyOwner), 2)
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
        await dai.mint(accounts[7], someDai, {
          from: lockOwner,
        })
        await dai.approve(lock.address, totalPrice, {
          from: accounts[7],
        })

        const { tokenId: newTokenId } = await purchaseKey(
          lock,
          accounts[7],
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
      ;({ tokenId } = await purchaseKey(lock, keyOwner, true))
      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await time.increaseTo(expirationTs.toNumber())
    })

    describe('fails when lock settings have changed', () => {
      it('should revert if price has changed', async () => {
        await lock.updateKeyPricing(
          ethers.utils.parseUnits('0.3', 'ether'),
          dai.address,
          { from: lockOwner }
        )
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })

      it('should revert if erc20 token has changed', async () => {
        // deploy another token
        const dai2 = await deployERC20(accounts[3])
        await dai2.mint(keyOwner, someDai, {
          from: accounts[3],
        })
        // update lock token without changing price
        await lock.updateKeyPricing(keyPrice, dai2.address, { from: lockOwner })
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })

      it('should revert if duration has changed', async () => {
        await lock.updateLockConfig(
          1000,
          await lock.maxNumberOfKeys(),
          await lock.maxKeysPerAddress(),
          { from: lockOwner }
        )
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })
    })

    describe('correctly transfer tokens', () => {
      it('should take from user balance', async () => {
        const balanceBefore = new BigNumber(await dai.balanceOf(keyOwner))
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const balanceAfter = new BigNumber(await dai.balanceOf(keyOwner))
        assert.equal(
          balanceBefore.minus(keyPrice.toString()).toString(),
          balanceAfter.toString()
        )
      })

      it('transferred the tokens to the contract', async () => {
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const balance = new BigNumber(await dai.balanceOf(lock.address))
        assert.equal(balance.toString(), keyPrice.mul(2).toString())
      })
    })

    it('should emit a KeyRenewed event', async () => {
      const tx = await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
      const { args } = tx.logs.find((v) => v.event === 'KeyExtended')
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
      assert.equal(args.newTimestamp.toNumber(), tsAfter.toNumber())
    })

    describe('erc20 balance / approval issues', () => {
      it('should revert if approval is too low', async () => {
        // reduce approval
        await dai.approve(lock.address, keyPrice, {
          from: keyOwner,
        })

        assert.equal(
          new BigNumber(await dai.allowance(keyOwner, lock.address)).toString(),
          keyPrice.toString()
        )

        // renew membership once
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)

        // no allowance left
        assert.equal(
          new BigNumber(await dai.allowance(keyOwner, lock.address)).toString(),
          0
        )
        const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await time.increaseTo(expirationTs.toNumber())
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
        const balanceBefore = new BigNumber(await dai.balanceOf(keyOwner))
        await dai.approve(keyOwner, balanceBefore, {
          from: keyOwner,
        })
        await dai.transferFrom(keyOwner, accounts[9], balanceBefore, {
          from: keyOwner,
        })
        assert.equal(new BigNumber(await dai.balanceOf(keyOwner)).toNumber(), 0)

        //
        const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await time.increaseTo(expirationTs.toNumber())

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
        await lock.transferFrom(keyOwner, accounts[9], tokenId, {
          from: keyOwner,
        })
        // should fail
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })

      it('reverts after a expireAndRefund', async () => {
        // renew once
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const balanceBefore = new BigNumber(await dai.balanceOf(keyOwner))
        const allowanceBefore = new BigNumber(
          await dai.allowance(keyOwner, lock.address)
        )

        const tx = await lock.expireAndRefundFor(tokenId, keyPrice, {
          from: lockOwner,
        })
        // amounts
        const refund = new BigNumber(tx.logs[0].args.refund)
        assert.equal(refund.toString(), keyPrice.toString())

        // refund ok
        assert.equal(
          new BigNumber(await dai.balanceOf(keyOwner)).toString(),
          balanceBefore.plus(keyPrice.toString()).toString()
        )

        // key expired
        assert.equal(await lock.getHasValidKey(keyOwner), false)
        assert.equal(await lock.isValidKey(tokenId), false)

        // ERC20 allowance has not been cancelled
        assert.equal(
          allowanceBefore.toString(),
          new BigNumber(await dai.allowance(keyOwner, lock.address)).toString()
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
      const testEventHooks = await TestEventHooks.new()
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
