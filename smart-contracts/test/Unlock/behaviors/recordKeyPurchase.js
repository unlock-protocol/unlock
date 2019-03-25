const deployLocks = require('../../helpers/deployLocks')

exports.shouldRecordKeyPurchase = function(accounts) {
  describe('Unlock / behaviors / recordKeyPurchase', function() {
    beforeEach(async function() {
      await deployLocks(this.unlock, accounts[0])
    })

    it('should fail if not invoked by a previously deployed lock')
    it(
      'should increase the grossNetworkProduct with the price of the key (ignoring the discount)'
    )
    it('should grant discount tokens to the referrer based on the key price')
  })
}
