const deployLocks = require('../../helpers/deployLocks')

exports.shouldRecordConsumedDiscount = function () {
  describe('recordConsumedDiscount', function () {
    let locks

    beforeEach(async function () {
      locks = await deployLocks(this.unlock)
    })

    it('should fail if not invoked by a previously deployed lock')
    it('should increase the totalDiscountGranted')
    it('should freeze the tokens used for the discount')
    it('should grant discount tokens to the owner of the lock as compensation')
  })
}
