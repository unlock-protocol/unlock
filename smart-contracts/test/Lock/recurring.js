const { tokens, constants } = require('hardlydifficult-ethereum-contracts')
const { reverts } = require('truffle-assertions')
const BigNumber = require('bignumber.js')
const { assert } = require('chai')
const deployLocks = require('../helpers/deployLocks')
const getProxy = require('../helpers/proxy')

const Unlock = artifacts.require('Unlock.sol')
const TestEventHooks = artifacts.require('TestEventHooks.sol')

let unlock
let locks
let dai

const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
const totalPrice = keyPrice.times(10)
const someDai = new BigNumber(web3.utils.toWei('10', 'ether'))
const { ZERO_ADDRESS } = constants

let lock
contract('Lock / Recurring memberships', (accounts) => {
  const lockOwner = accounts[0]
  const keyOwner = accounts[1]
  // const referrer = accounts[3]

  beforeEach(async () => {
    dai = await tokens.dai.deploy(web3, lockOwner)

    // Mint some dais for testing
    await dai.mint(keyOwner, someDai, {
      from: lockOwner,
    })

    unlock = await getProxy(Unlock)
    locks = await deployLocks(unlock, lockOwner, dai.address)
    lock = locks.ERC20

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
        new BigNumber(await dai.allowance(keyOwner, lock.address)).toFixed(),
        totalPrice.toFixed()
      )
    })
    it('balance should be enough', async () => {
      assert.equal(
        new BigNumber(await dai.balanceOf(keyOwner)).toFixed(),
        someDai.toFixed()
      )
    })
  })

  describe('renewMembershipFor', () => {
    describe('fails with wrong lock settings', async () => {
      it('can not renew non-expiring keys', async () => {
        await dai.approve(locks.NON_EXPIRING.address, totalPrice, {
          from: keyOwner,
        })

        const tx = await locks.NON_EXPIRING.purchase(
          [keyPrice],
          [keyOwner],
          [ZERO_ADDRESS],
          [ZERO_ADDRESS],
          [],
          { from: keyOwner }
        )

        const { args } = tx.logs.find((v) => v.event === 'Transfer')
        const { tokenId: newTokenId } = args

        await reverts(
          locks.NON_EXPIRING.renewMembershipFor(newTokenId, ZERO_ADDRESS),
          'NON_EXPIRING_LOCK'
        )
      })

      it('can not renew lock with no ERC20 tokens set', async () => {
        // remove dai token
        await locks.FIRST.updateKeyPricing(keyPrice, ZERO_ADDRESS)

        const tx = await locks.FIRST.purchase(
          [],
          [keyOwner],
          [ZERO_ADDRESS],
          [ZERO_ADDRESS],
          [],
          { from: keyOwner, value: keyPrice }
        )

        const { args } = tx.logs.find((v) => v.event === 'Transfer')
        const { tokenId: newTokenId } = args

        await reverts(
          locks.FIRST.renewMembershipFor(newTokenId, ZERO_ADDRESS),
          'NON_ERC20_LOCK'
        )
      })
    })

    it('should revert if key doesnt exist', async () => {
      await reverts(lock.renewMembershipFor(321, ZERO_ADDRESS), 'NO_SUCH_KEY')
    })

    let tokenId
    beforeEach(async () => {
      const tx = await lock.purchase(
        [keyPrice],
        [keyOwner],
        [ZERO_ADDRESS],
        [ZERO_ADDRESS],
        [],
        { from: keyOwner }
      )

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId: newTokenId } = args
      tokenId = newTokenId
    })

    describe('fails when lock settings have changed', () => {
      it('should revert if price has changed', async () => {
        await lock.updateKeyPricing(
          web3.utils.toWei('0.3', 'ether'),
          dai.address,
          { from: lockOwner }
        )
        await reverts(
          lock.renewMembershipFor(tokenId, ZERO_ADDRESS),
          'PRICE_CHANGED'
        )
      })

      it('should revert if erc20 token has changed', async () => {
        // deploy another token
        const dai2 = await tokens.dai.deploy(web3, accounts[3])
        await dai2.mint(keyOwner, someDai, {
          from: accounts[3],
        })
        // update lock token without changing price
        await lock.updateKeyPricing(keyPrice, dai2.address, { from: lockOwner })
        await reverts(
          lock.renewMembershipFor(tokenId, ZERO_ADDRESS),
          'TOKEN_CHANGED'
        )
      })

      it('should revert if duration has changed', async () => {
        await lock.setExpirationDuration(1000, { from: lockOwner })
        await reverts(
          lock.renewMembershipFor(tokenId, ZERO_ADDRESS),
          'DURATION_CHANGED'
        )
      })
    })

    describe('correctly transfer tokens', () => {
      it('should take from user balance', async () => {
        const balanceBefore = new BigNumber(await dai.balanceOf(keyOwner))
        await lock.renewMembershipFor(tokenId, ZERO_ADDRESS)
        const balanceAfter = new BigNumber(await dai.balanceOf(keyOwner))
        assert.equal(
          balanceBefore.minus(keyPrice).toFixed(),
          balanceAfter.toFixed()
        )
      })

      it('transferred the tokens to the contract', async () => {
        await lock.renewMembershipFor(tokenId, ZERO_ADDRESS)
        const balance = new BigNumber(await dai.balanceOf(lock.address))
        assert.equal(balance.toFixed(), keyPrice.times(2).toFixed())
      })
    })

    it('should emit a KeyRenewed event', async () => {
      const tx = await lock.renewMembershipFor(tokenId, ZERO_ADDRESS)
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
          new BigNumber(await dai.allowance(keyOwner, lock.address)).toFixed(),
          keyPrice.toFixed()
        )

        // renew membership once
        await lock.renewMembershipFor(tokenId, ZERO_ADDRESS)

        // no allowance left
        assert.equal(
          new BigNumber(await dai.allowance(keyOwner, lock.address)).toFixed(),
          0
        )
        // now reverts
        await reverts(
          lock.renewMembershipFor(tokenId, ZERO_ADDRESS),
          'Dai/insufficient-allowance'
        )
      })

      it('should revert if the ERC20 balance is not enough', async () => {
        // renew membership once
        await lock.renewMembershipFor(tokenId, ZERO_ADDRESS)

        // empty the account
        const balanceBefore = new BigNumber(await dai.balanceOf(keyOwner))
        await dai.transferFrom(keyOwner, accounts[9], balanceBefore, {
          from: keyOwner,
        })
        assert.equal(new BigNumber(await dai.balanceOf(keyOwner)).toNumber(), 0)

        // now funds are not enough
        await reverts(
          lock.renewMembershipFor(tokenId, ZERO_ADDRESS),
          'Dai/insufficient-balance'
        )
      })
    })

    describe('cancel or expire membership', () => {
      it('expireAndRefund works correctly', async () => {
        const balanceBefore = new BigNumber(await dai.balanceOf(keyOwner))
        // expire
        const tx = await lock.expireAndRefundFor(tokenId, keyPrice, {
          from: lockOwner,
        })
        // amounts
        const refund = new BigNumber(tx.logs[0].args.refund)
        assert.equal(refund.toFixed(), keyPrice.toFixed())

        // refund ok
        assert.equal(
          new BigNumber(await dai.balanceOf(keyOwner)),
          balanceBefore.plus(keyPrice).toFixed()
        )

        // key expired
        assert.equal(await lock.getHasValidKey.call(keyOwner), false)

        // ERC20 allowance cleared
        assert.equal(
          new BigNumber(await dai.allowance(keyOwner, lock.address)).toFixed(),
          0
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
        ZERO_ADDRESS,
        ZERO_ADDRESS,
        ZERO_ADDRESS
      )
      await reverts(
        lock.renewMembershipFor(tokenId, ZERO_ADDRESS),
        'PURCHASE_BLOCKED_BY_HOOK'
      )
    })
  })
})
