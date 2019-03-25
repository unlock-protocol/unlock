const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / transferFee', accounts => {
  let lock

  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
  })

  it('has a default fee of 5%', async () => {
    const feeNumerator = new BigNumber(await lock.transferFeeNumerator.call())
    const feeDenominator = new BigNumber(
      await lock.transferFeeDenominator.call()
    )
    assert.equal(feeNumerator.div(feeDenominator).toFixed(), 0.05)
  })

  describe('the lock owner can change the fee', () => {
    let tx

    before(async () => {
      // Change the fee to 0.025%
      tx = await lock.updateTransferFee(1, 4000)
    })

    it('has an updated fee', async () => {
      const feeNumerator = new BigNumber(await lock.transferFeeNumerator.call())
      const feeDenominator = new BigNumber(
        await lock.transferFeeDenominator.call()
      )
      assert.equal(feeNumerator.div(feeDenominator).toFixed(), 0.00025)
    })

    it('emits the TransferFeeDenominatorChanged event', async () => {
      assert.equal(tx.logs[0].event, 'TransferFeeChanged')
      assert.equal(tx.logs[0].args.oldTransferFeeNumerator, 5)
      assert.equal(tx.logs[0].args.oldTransferFeeDenominator, 100)
      assert.equal(tx.logs[0].args.transferFeeNumerator, 1)
      assert.equal(tx.logs[0].args.transferFeeDenominator, 4000)
    })
  })

  describe('should fail if', () => {
    it('called by an account which does not own the lock', async () => {
      await shouldFail(lock.updateTransferFee(1, 100, { from: accounts[1] }))
    })

    it('attempt to set the denominator to 0', async () => {
      await shouldFail(lock.updateTransferFee(1, 0), 'INVALID_RATE')
    })
  })
})
