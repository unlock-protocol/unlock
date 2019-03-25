const deployLocks = require('../../helpers/deployLocks')

exports.shouldRecordConsumedDiscount = function(accounts) {
  describe('Unlock / behaviors / recordConsumedDiscount', function() {
    beforeEach(async function() {
      await deployLocks(this.unlock, accounts[0])
    })

    it('should fail if not invoked by a previously deployed lock')
    it('should increase the totalDiscountGranted')
    it('should freeze the tokens used for the discount')
    it('should grant discount tokens to the owner of the lock as compensation')
  })
}
