
const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock)
      })
      .then(_locks => {
        locks = _locks
      })
  })

  describe('recordConsumedDiscount', () => {
    it('should fail if not invoked by a previously deployed lock')
    it('should increase the totalDiscountGranted')
    it('should freeze the tokens used for the discount')
    it('should grant discount tokens to the owner of the lock as compensation')
  })
})
