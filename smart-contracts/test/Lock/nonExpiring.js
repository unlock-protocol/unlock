const { assert } = require('chai')
const { constants } = require('hardlydifficult-ethereum-contracts')
const { reverts } = require('truffle-assertions')
const { time } = require('@openzeppelin/test-helpers')
const BigNumber = require('bignumber.js')
const { network } = require('hardhat')

const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let lock
let locks
let unlock

contract('Lock / non expiring', (accounts) => {
  const from = accounts[1]
  const keyOwner = accounts[2]
  let keyPrice
  let keyId

  before(async () => {
    unlock = await getProxy(unlockContract)
  })

  after(async () => {
    await network.provider.request({ method: 'hardhat_reset' })
  })

  beforeEach(async () => {
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.NON_EXPIRING
    keyPrice = await lock.keyPrice()
    await lock.purchase(0, keyOwner, constants.ZERO_ADDRESS, [], {
      from,
      value: keyPrice,
    })
    keyId = await lock.getTokenIdFor.call(keyOwner)
  })

  describe('Create lock', () => {
    it('should set the expiration date to MAX_UINT', async () => {
      assert.equal(
        (await lock.expirationDuration()).toString(),
        constants.MAX_UINT.toString()
      )
    })
  })

  describe('Purchased key', () => {
    it('should have an expiration timestamp of as max uint', async () => {
      assert.equal(await lock.getHasValidKey(keyOwner), true)
      assert.equal(await lock.balanceOf(keyOwner), 1)
      assert.equal(
        (await lock.keyExpirationTimestampFor(keyOwner)).toString(),
        constants.MAX_UINT.toString()
      )
    })

    it('should be valid far in the future', async () => {
      const fiveHundredYears = 5 * 100 * 365 * 24 * 60 * 60 * 1000
      await time.increaseTo(Date.now() + fiveHundredYears)
      assert.equal(await lock.getHasValidKey(keyOwner), true)
      assert.equal(await lock.balanceOf(keyOwner), 1)
    })

    describe('Purchase an active key', () => {
      it('should throw an error when re-purchasing an existing key', async () => {
        await reverts(
          lock.purchase(0, keyOwner, constants.ZERO_ADDRESS, [], {
            from,
            value: keyPrice,
          }),
          'A valid non-expiring key can not be purchased twice'
        )
      })
    })

    describe('Purchase a cancelled key', () => {
      it('should re-activate the key', async () => {
        // cancel key
        await lock.cancelAndRefund(keyId, { from: keyOwner })
        assert.equal(await lock.getHasValidKey(keyOwner), false)
        assert.equal(await lock.balanceOf(keyOwner), 0)

        // purchase again
        await lock.purchase(0, keyOwner, constants.ZERO_ADDRESS, [], {
          from,
          value: keyPrice,
        })

        // key is active again
        assert.equal(await lock.getHasValidKey(keyOwner), true)
        assert.equal(await lock.balanceOf(keyOwner), 1)
        assert.equal(
          (await lock.keyExpirationTimestampFor(keyOwner)).toString(),
          constants.MAX_UINT.toString()
        )
      })
    })
  })

  describe('Refund', () => {
    describe('getCancelAndRefundValueFor', () => {
      it('should refund entire price, regardless of time passed since purchase', async () => {
        // check the refund value
        assert.equal(
          (await lock.getCancelAndRefundValueFor(keyOwner)).toString(),
          keyPrice.toString()
        )
        const fiveHundredYears = 5 * 100 * 365 * 24 * 60 * 60 * 1000
        await time.increaseTo(Date.now() + fiveHundredYears)
        assert.equal(
          (await lock.getCancelAndRefundValueFor(keyOwner)).toString(),
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
        const tx = await lock.cancelAndRefund(keyId, { from: keyOwner })

        // make sure key is cancelled
        assert.equal(await lock.getHasValidKey(keyOwner), false)
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
    it('should transfer a valid non-expiring key to someone who doesn have one', async () => {
      const keyReceiver = accounts[3]
      await lock.transfer(keyReceiver, 1, { from: keyOwner })

      assert.equal(await lock.getHasValidKey(keyOwner), false)
      assert.equal(await lock.getHasValidKey(keyReceiver), true)

      assert.equal(
        (await lock.keyExpirationTimestampFor(keyReceiver)).toString(),
        constants.MAX_UINT.toString()
      )

      const expiredKeyTs = new BigNumber(
        await lock.keyExpirationTimestampFor(keyOwner)
      )
      let blockTimestampAfter = new BigNumber(
        (await web3.eth.getBlock('latest')).timestamp
      )
      assert.equal(expiredKeyTs.toString(), blockTimestampAfter.toString())
    })
  })

  it('should prevent from transfering a non-expiring key to someone who already has one', async () => {
    const keyReceiver = accounts[3]

    // purchase a key
    await lock.purchase(0, keyReceiver, constants.ZERO_ADDRESS, [], {
      from,
      value: keyPrice,
    })
    // transfer fails
    await reverts(
      lock.transfer(keyReceiver, 1, { from: keyOwner }),
      'Recipient already owns a non-expiring key'
    )
  })
})
