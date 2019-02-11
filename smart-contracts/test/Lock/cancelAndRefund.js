const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')
let unlock, locks

contract('Lock', (accounts) => {
  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock)
  })

  describe('cancelAndRefund', () => {
    let lock
    const keyOwners = [accounts[1], accounts[2]]
    const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))
    let lockOwner

    before(async () => {
      lock = locks['SECOND']
      const purchases = keyOwners.map((account) => {
        return lock.purchaseFor(account, Web3Utils.toHex(''), {
          value: keyPrice.toFixed(),
          from: account
        })
      })
      await Promise.all(purchases)
      lockOwner = await lock.owner.call()
    })

    it('should return the correct penalty', async () => {
      const penalty = await lock.cancelRefundPenaltyDenominator.call()
      assert.equal(penalty, 10) // default of 10%
    })

    it('the amount of refund should be less than the original keyPrice', async () => {
      const estimatedRefund = new BigNumber(await lock.getCancelAndRefundValueFor.call(keyOwners[0]))
      assert(estimatedRefund.lt(keyPrice))
    })

    describe('should cancel and refund when enough time remains', () => {
      let initialLockBalance, initialKeyOwnerBalance, estimatedRefund, txObj, withdrawalAmount

      before(async () => {
        initialLockBalance = new BigNumber(await web3.eth.getBalance(lock.address))
        initialKeyOwnerBalance = new BigNumber(await web3.eth.getBalance(keyOwners[0]))
        estimatedRefund = new BigNumber(await lock.getCancelAndRefundValueFor.call(keyOwners[0]))
        txObj = await lock.cancelAndRefund({
          from: keyOwners[0]
        })
        withdrawalAmount = await web3.eth.getBalance(lock.address).minus(initialLockBalance)
      })

      it('should emit a Transfer to 0 event', async () => {
        assert.equal(txObj.logs[0].event, 'Transfer')
        assert.equal(txObj.logs[0].args._from, keyOwners[0])
        assert.equal(txObj.logs[0].args._to, Web3Utils.padLeft(0, 40))
      })

      it('should emit a CancelKey 0 event', async () => {
        assert.equal(txObj.logs[1].event, 'CancelKey')
      })

      it('the amount of refund should be greater than 0', async () => {
        const refund = new BigNumber(txObj.logs[1].args.refund)
        assert(refund.gt(0))
      })

      it('the amount of refund should be less than or equal to the original key price', async () => {
        const refund = new BigNumber(txObj.logs[1].args.refund)
        assert(refund.lt(keyPrice))
      })

      it('the amount of refund should be less than or equal to the estimated refund', async () => {
        const refund = new BigNumber(txObj.logs[1].args.refund)
        assert(refund.lte(estimatedRefund))
      })

      it('should make the key no longer valid (i.e. expired)', async () => {
        const isValid = await lock.getHasValidKey.call(keyOwners[0])
        assert.equal(isValid, false)
      })

      it('should increase the owner\'s balance with the amount of funds withdrawn from the lock', async () => {
        const txHash = await web3.eth.getTransaction(txObj.tx)
        const gasUsed = new BigNumber(txObj.receipt.gasUsed)
        const gasPrice = new BigNumber(txHash.gasPrice)
        const txFee = gasPrice.times(gasUsed)
        const finalOwnerBalance = new BigNumber(await web3.eth.getBalance(keyOwners[0]))
        assert(finalOwnerBalance.toFixed(), initialKeyOwnerBalance.plus(withdrawalAmount).minus(txFee).toFixed())
      })
    })

    describe('should fail when', () => {
      it('should fail if the Lock owner withdraws too much funds', async () => {
        await lock.withdraw({
          from: lockOwner
        })
        await shouldFail(lock.cancelAndRefund({
          from: keyOwners[1]
        }), '')
      })

      it('the key is expired', async () => {
        await lock.expireKeyFor(keyOwners[1], {
          from: lockOwner
        })
        await shouldFail(lock.cancelAndRefund({
          from: keyOwners[1]
        }), 'Key is not valid')
      })

      it('the owner does not have a key', async () => {
        await shouldFail(lock.cancelAndRefund({
          from: accounts[7]
        }), 'Key is not valid')
      })
    })

    describe('allows the Lock owner to specify a different cancelation penalty', () => {
      let tx

      before(async () => {
        tx = await lock.updateCancelRefundPenaltyDenominator(5) // 20%
      })

      it('should trigger an event', async () => {
        const event = tx.logs.find((log) => {
          return log.event === 'CancelRefundPenaltyDenominatorChanged'
        })
        assert.equal(new BigNumber(event.args.oldPenaltyDenominator).toFixed(), 10)
        assert.equal(new BigNumber(event.args.refundPenaltyDenominator).toFixed(), 5)
      })

      it('should return the correct penalty', async () => {
        const penalty = await lock.cancelRefundPenaltyDenominator.call()
        assert.equal(penalty, 5) // updated to 20%
      })

      it('should still allow refund', async () => {
        const txObj = await lock.cancelAndRefund({
          from: keyOwners[0]
        })
        const refund = new BigNumber(txObj.logs[1].args.refund)
        assert(refund.gt(0))
      })
    })
  })
})
