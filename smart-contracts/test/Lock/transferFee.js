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

  it('has a default fee of 10%', async () => {
    const feeDenominator = new BigNumber(await lock.transferFeeDenominator.call())
    assert.equal(feeDenominator.toFixed(), 10)
  })

  describe('the lock owner can change the fee', () => {
    let tx

    before(async () => {
      tx = await lock.updateTransferFeeDenominator(5)
    })

    it('has an updated fee', async () => {
      const feeDenominator = new BigNumber(await lock.transferFeeDenominator.call())
      assert.equal(feeDenominator.toFixed(), 5)
    })

    it('emits the TransferFeeDenominatorChanged event', async () => {
      assert.equal(tx.logs[0].event, 'TransferFeeDenominatorChanged')
      assert.equal(tx.logs[0].args.oldTransferFeeDenominator, 10)
      assert.equal(tx.logs[0].args.transferFeeDenominator, 5)
    })
  })

  describe('should fail if', () => {
    it('called by an account which does not own the lock', async () => {
      await shouldFail(lock.updateTransferFeeDenominator(5, { from: accounts[1] }))
    })
  })
})
