const assert = require('assert')
const {
  deployERC20,
  reverts,
  purchaseKey,
  ADDRESS_ZERO,
  deployLock,
  increaseTimeTo,
  deployWETH,
  createMockOracle,
  deployContracts,
} = require('../helpers')
const { ethers } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

let lock
let dai

const keyPrice = ethers.parseUnits('0.01', 'ether')
const totalPrice = keyPrice * 10n
const someDai = ethers.parseUnits('100', 'ether')

describe('Lock / Recurring memberships', () => {
  let deployer, keyOwner, referrer, attacker
  let up, unlock

  beforeEach(async () => {
    ;[deployer, keyOwner, referrer, attacker] = await ethers.getSigners()
    dai = await deployERC20(await deployer.getAddress(), true)

    // Mint some dais for testing
    await dai.mint(await keyOwner.getAddress(), someDai)

    // deploy contracts
    ;({ unlock, up } = await deployContracts())
    lock = await deployLock({
      tokenAddress: await dai.getAddress(),
      unlock,
    })

    // set ERC20 approval for entire scope
    await dai.connect(keyOwner).approve(await lock.getAddress(), totalPrice)
  })

  describe('erc20 status', () => {
    it('address is set correctly in lock', async () => {
      assert.equal(await lock.tokenAddress(), await dai.getAddress())
    })
    it('approval should be set correctly', async () => {
      assert.equal(
        await dai.allowance(
          await keyOwner.getAddress(),
          await lock.getAddress()
        ),
        totalPrice
      )
    })
    it('balance should be enough', async () => {
      assert.equal(await dai.balanceOf(await keyOwner.getAddress()), someDai)
    })
  })

  describe('renewMembershipFor', () => {
    describe('fails with wrong lock settings', async () => {
      it('can not renew non-expiring keys', async () => {
        const lockNonExpiring = await deployLock({
          tokenAddress: await dai.getAddress(),
          name: 'NON_EXPIRING',
          isEthers: true,
        })
        await dai
          .connect(keyOwner)
          .approve(await lockNonExpiring.getAddress(), totalPrice)
        const { tokenId: newTokenId } = await purchaseKey(
          lockNonExpiring,
          await keyOwner.getAddress(),
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
        assert.equal(await lock.totalKeys(await keyOwner.getAddress()), 1)
        const { tokenId: newTokenId } = await purchaseKey(
          lock,
          await keyOwner.getAddress()
        )
        assert.equal(await lock.totalKeys(await keyOwner.getAddress()), 2)
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
        await dai.mint(await attacker.getAddress(), someDai)
        await dai.connect(attacker).approve(await lock.getAddress(), totalPrice)

        const { tokenId: newTokenId } = await purchaseKey(
          lock,
          await attacker.getAddress(),
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
      ;({ tokenId } = await purchaseKey(
        lock,
        await keyOwner.getAddress(),
        true
      ))
      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await increaseTimeTo(expirationTs)
    })

    describe('fails when lock settings have changed', () => {
      it('should revert if price has changed', async () => {
        await lock.updateKeyPricing(
          ethers.parseUnits('0.3', 'ether'),
          await dai.getAddress()
        )
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })

      it('should revert if erc20 token has changed', async () => {
        // deploy another token
        const dai2 = await deployERC20(attacker, true)
        await dai2.connect(attacker).mint(await keyOwner.getAddress(), someDai)
        // update lock token without changing price
        await lock.updateKeyPricing(keyPrice, await dai2.getAddress())
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
        const balanceBefore = await dai.balanceOf(await keyOwner.getAddress())
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const balanceAfter = await dai.balanceOf(await keyOwner.getAddress())
        assert.equal(balanceBefore - keyPrice, balanceAfter)
      })

      it('transferred the tokens to the contract', async () => {
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const balance = await dai.balanceOf(await lock.getAddress())
        assert.equal(balance, keyPrice * 2n)
      })
    })

    it('should emit a KeyRenewed event', async () => {
      const tx = await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
      const receipt = await tx.wait()
      const { args } = await getEvent(receipt, 'KeyExtended')
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      assert.equal(args.tokenId, tokenId)
      assert.equal(args.newTimestamp, tsAfter)
    })

    describe('erc20 balance / approval issues', () => {
      it('should revert if approval is too low', async () => {
        // reduce approval
        await dai.connect(keyOwner).approve(await lock.getAddress(), keyPrice)

        assert.equal(
          await dai.allowance(
            await keyOwner.getAddress(),
            await lock.getAddress()
          ),
          keyPrice
        )

        // renew membership once
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)

        // no allowance left
        assert.equal(
          await dai.allowance(
            await keyOwner.getAddress(),
            await lock.getAddress()
          ),
          '0'
        )
        const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await increaseTimeTo(expirationTs)
        // now reverts
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'ERC20InsufficientAllowance'
        )
      })

      it('should revert if the ERC20 balance is not enough', async () => {
        // renew membership once
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)

        // empty the account
        const balanceBefore = await dai.balanceOf(await keyOwner.getAddress())
        await dai
          .connect(keyOwner)
          .approve(await keyOwner.getAddress(), balanceBefore)
        await dai
          .connect(keyOwner)
          .transferFrom(
            await keyOwner.getAddress(),
            await attacker.getAddress(),
            balanceBefore
          )
        assert.equal(await dai.balanceOf(await keyOwner.getAddress()), '0')

        //
        const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await increaseTimeTo(expirationTs)

        // now funds are not enough
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'ERC20InsufficientBalance'
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
          .transferFrom(
            await keyOwner.getAddress(),
            await attacker.getAddress(),
            tokenId
          )
        // should fail
        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })

      it('reverts after a expireAndRefund', async () => {
        // renew once
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const balanceBefore = await dai.balanceOf(await keyOwner.getAddress())
        const allowanceBefore = await dai.allowance(
          await keyOwner.getAddress(),
          await lock.getAddress()
        )
        const tx = await lock.expireAndRefundFor(tokenId, keyPrice)
        const receipt = await tx.wait()

        const {
          args: { refund },
        } = await getEvent(receipt, 'CancelKey')
        assert.equal(refund, keyPrice)

        // refund ok
        assert.equal(
          await dai.balanceOf(await keyOwner.getAddress()),
          balanceBefore + keyPrice
        )

        // key expired
        assert.equal(
          await lock.getHasValidKey(await keyOwner.getAddress()),
          false
        )
        assert.equal(await lock.isValidKey(tokenId), false)

        // ERC20 allowance has not been cancelled
        assert.equal(
          allowanceBefore,
          await dai.allowance(
            await keyOwner.getAddress(),
            await lock.getAddress()
          )
        )

        await reverts(
          lock.renewMembershipFor(tokenId, ADDRESS_ZERO),
          'LOCK_HAS_CHANGED'
        )
      })
    })

    describe('should remember the referrer set in first purchase', async () => {
      // 1% in basis points
      const BASIS_POINTS_DEN = 10000n
      const generalFee = 1000n

      beforeEach(async () => {
        // set general referrer fee to 1%
        await lock.setReferrerFee(ADDRESS_ZERO, generalFee)

        // set ERC20 approval for entire scope
        await dai.connect(keyOwner).approve(await lock.getAddress(), totalPrice)

        // purchase a key with referrer set
        const tx = await lock
          .connect(keyOwner)
          .purchase(
            [keyPrice],
            [await keyOwner.getAddress()],
            [await referrer.getAddress()],
            [ADDRESS_ZERO],
            ['0x']
          )
        const receipt = await tx.wait()
        const { args } = await getEvent(receipt, 'Transfer')
        ;({ tokenId } = args)
      })
      it('referrer has some UP when no address is passed', async () => {
        const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await increaseTimeTo(expirationTs)
        const before = await dai.balanceOf(await referrer.getAddress())
        await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
        const actual = await dai.balanceOf(await referrer.getAddress())
        const amountEarned = actual - before
        assert.notEqual(amountEarned, 0n)
        const fee = (keyPrice * generalFee) / BASIS_POINTS_DEN
        assert.equal(amountEarned, fee)
      })
      it('attacker cant bypass existing referrer', async () => {
        const before = await dai.balanceOf(await attacker.getAddress())
        const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
        await increaseTimeTo(expirationTs)
        await lock.renewMembershipFor(tokenId, await attacker.getAddress())
        const actual = await dai.balanceOf(await attacker.getAddress())
        assert.equal(actual - before, 0n)
      })
    })

    it('should call onPurchase if set', async () => {
      // set hook
      const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
      const testEventHooks = await TestEventHooks.deploy()
      await lock.setEventHooks(
        await testEventHooks.getAddress(),
        ADDRESS_ZERO,
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
