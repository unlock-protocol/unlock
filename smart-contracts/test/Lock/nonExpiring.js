const { assert } = require('chai')
const { time } = require('@openzeppelin/test-helpers')
const BigNumber = require('bignumber.js')
const { ADDRESS_ZERO, MAX_UINT } = require('../helpers/constants')

const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { purchaseKey } = require('../helpers')

let lock
let locks
let unlock

contract('Lock / non expiring', (accounts) => {
  const keyOwner = accounts[2]
  let keyPrice
  let tokenId

  before(async () => {
    unlock = await getContractInstance(unlockContract)
  })

  beforeEach(async () => {
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.NON_EXPIRING
    keyPrice = await lock.keyPrice()
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
  })

  describe('Create lock', () => {
    it('should set the expiration date to MAX_UINT', async () => {
      assert.equal((await lock.expirationDuration()).toString(), MAX_UINT)
    })
  })

  describe('Purchased key', () => {
    it('should have an expiration timestamp of as max uint', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.balanceOf(keyOwner), 1)
      assert.equal(
        (await lock.keyExpirationTimestampFor(tokenId)).toString(),
        MAX_UINT
      )
    })

    it('should be valid far in the future', async () => {
      const fiveHundredYears = 5 * 100 * 365 * 24 * 60 * 60 * 1000
      await time.increaseTo(Date.now() + fiveHundredYears)
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.balanceOf(keyOwner), 1)
    })
  })

  describe('Refund', () => {
    describe('getCancelAndRefundValue', () => {
      it('should refund entire price, regardless of time passed since purchase', async () => {
        // check the refund value
        assert.equal(
          (await lock.getCancelAndRefundValue(tokenId)).toString(),
          keyPrice.toString()
        )
        const fiveHundredYears = 5 * 100 * 365 * 24 * 60 * 60 * 1000
        await time.increaseTo(Date.now() + fiveHundredYears)
        assert.equal(
          (await lock.getCancelAndRefundValue(tokenId)).toString(),
          keyPrice.toString()
        )
      })
    })
    describe('cancelAndRefund', () => {
      it('should transfer entire price back', async () => {
        // make sure the refund actually happened
        const initialLockBalance = new BigNumber(
          await web3.eth.getBalance(lock.address)
        )
        const initialKeyOwnerBalance = new BigNumber(
          await web3.eth.getBalance(keyOwner)
        )

        // refund
        const tx = await lock.cancelAndRefund(tokenId, { from: keyOwner })

        // make sure key is cancelled
        assert.equal(await lock.isValidKey(tokenId), false)
        assert.equal(await lock.balanceOf(keyOwner), 0)
        assert.equal(tx.logs[0].event, 'CancelKey')
        const refund = new BigNumber(tx.logs[0].args.refund)
        assert(refund.isEqualTo(keyPrice))

        // get gas used
        const txHash = await web3.eth.getTransaction(tx.tx)
        const gasUsed = new BigNumber(tx.receipt.gasUsed)
        const gasPrice = new BigNumber(txHash.gasPrice)
        const txFee = gasPrice.times(gasUsed)

        // check key owner balance
        const finalOwnerBalance = new BigNumber(
          await web3.eth.getBalance(keyOwner)
        )
        assert(
          finalOwnerBalance.toFixed(),
          initialKeyOwnerBalance.plus(refund).minus(txFee).toFixed()
        )

        // also check lock balance
        const finalLockBalance = new BigNumber(
          await web3.eth.getBalance(lock.address)
        )
        assert(
          finalLockBalance.toFixed(),
          initialLockBalance.minus(refund).toFixed()
        )
      })
    })
  })

  describe('Transfer', () => {
    it('should transfer a valid non-expiring key to someone else', async () => {
      const keyReceiver = accounts[3]
      await lock.transferFrom(keyOwner, keyReceiver, tokenId, {
        from: keyOwner,
      })

      assert.equal(await lock.getHasValidKey(keyOwner), false)
      assert.equal(await lock.getHasValidKey(keyReceiver), true)

      assert.equal(
        (await lock.keyExpirationTimestampFor(tokenId)).toString(),
        MAX_UINT
      )
    })
  })
})
