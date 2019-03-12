const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')
let unlock, locks

contract('Lock / cancelAndRefund', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let lock
  const keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]
  const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))
  let lockOwner

  before(async () => {
    lock = locks['SECOND']
    const purchases = keyOwners.map(account => {
      return lock.purchaseFor(account, {
        value: keyPrice.toFixed(),
        from: account
      })
    })
    await Promise.all(purchases)
    lockOwner = await lock.owner.call()
  })

  it('should return the correct penalty', async () => {
    const penalty = await lock.refundPenaltyDenominator.call()
    assert.equal(penalty, 10) // default of 10%
  })

  it('the amount of refund should be less than the original keyPrice', async () => {
    const estimatedRefund = new BigNumber(
      await lock.getCancelAndRefundValueFor.call(keyOwners[0])
    )
    assert(estimatedRefund.lt(keyPrice))
  })

  describe('should cancel and refund when enough time remains', () => {
    let initialLockBalance,
      initialKeyOwnerBalance,
      estimatedRefund,
      txObj,
      withdrawalAmount

    before(async () => {
      initialLockBalance = new BigNumber(
        await web3.eth.getBalance(lock.address)
      )
      initialKeyOwnerBalance = new BigNumber(
        await web3.eth.getBalance(keyOwners[0])
      )
      estimatedRefund = new BigNumber(
        await lock.getCancelAndRefundValueFor.call(keyOwners[0])
      )
      txObj = await lock.cancelAndRefund({
        from: keyOwners[0]
      })
      withdrawalAmount = new BigNumber(
        await web3.eth.getBalance(lock.address)
      ).minus(initialLockBalance)
    })

    it('should emit a CancelKey event', async () => {
      assert.equal(txObj.logs[0].event, 'CancelKey')
    })

    it('the amount of refund should be greater than 0', async () => {
      const refund = new BigNumber(txObj.logs[0].args.refund)
      assert(refund.gt(0))
    })

    it('the amount of refund should be less than or equal to the original key price', async () => {
      const refund = new BigNumber(txObj.logs[0].args.refund)
      assert(refund.lt(keyPrice))
    })

    it('the amount of refund should be less than or equal to the estimated refund', async () => {
      const refund = new BigNumber(txObj.logs[0].args.refund)
      assert(refund.lte(estimatedRefund))
    })

    it('should make the key no longer valid (i.e. expired)', async () => {
      const isValid = await lock.getHasValidKey.call(keyOwners[0])
      assert.equal(isValid, false)
    })

    it("should increase the owner's balance with the amount of funds withdrawn from the lock", async () => {
      const txHash = await web3.eth.getTransaction(txObj.tx)
      const gasUsed = new BigNumber(txObj.receipt.gasUsed)
      const gasPrice = new BigNumber(txHash.gasPrice)
      const txFee = gasPrice.times(gasUsed)
      const finalOwnerBalance = new BigNumber(
        await web3.eth.getBalance(keyOwners[0])
      )
      assert(
        finalOwnerBalance.toFixed(),
        initialKeyOwnerBalance
          .plus(withdrawalAmount)
          .minus(txFee)
          .toFixed()
      )
    })
  })

  describe('allows the Lock owner to specify a different cancelation penalty', () => {
    let tx

    before(async () => {
      tx = await lock.updateRefundPenaltyDenominator(5) // 20%
    })

    it('should trigger an event', async () => {
      const event = tx.logs.find(log => {
        return log.event === 'RefundPenaltyDenominatorChanged'
      })
      assert.equal(
        new BigNumber(event.args.oldPenaltyDenominator).toFixed(),
        10
      )
      assert.equal(
        new BigNumber(event.args.refundPenaltyDenominator).toFixed(),
        5
      )
    })

    it('should return the correct penalty', async () => {
      const penalty = await lock.refundPenaltyDenominator.call()
      assert.equal(penalty, 5) // updated to 20%
    })

    it('should still allow refund', async () => {
      const txObj = await lock.cancelAndRefund({
        from: keyOwners[2]
      })
      const refund = new BigNumber(txObj.logs[0].args.refund)
      assert(refund.gt(0))
    })
  })

  describe('should fail when', () => {
    it('should fail if the Lock owner withdraws too much funds', async () => {
      await lock.withdraw({
        from: lockOwner
      })
      await shouldFail(
        lock.cancelAndRefund({
          from: keyOwners[3]
        }),
        ''
      )
    })

    it('the key is expired', async () => {
      await lock.expireKeyFor(keyOwners[3], {
        from: lockOwner
      })
      await shouldFail(
        lock.cancelAndRefund({
          from: keyOwners[3]
        }),
        'KEY_NOT_VALID'
      )
    })

    it('the owner does not have a key', async () => {
      await shouldFail(
        lock.cancelAndRefund({
          from: accounts[7]
        }),
        'KEY_NOT_VALID'
      )
    })
  })
})
