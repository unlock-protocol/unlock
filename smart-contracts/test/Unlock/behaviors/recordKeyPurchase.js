
const deployLocks = require('../../helpers/deployLocks')

exports.shouldRecordKeyPurchase = function () {
  describe('recordKeyPurchase', function () {
    let locks

    beforeEach(async function () {
      locks = await deployLocks(this.unlock)
    })

    it('should fail if not invoked by a previously deployed lock')
    it('should increase the grossNetworkProduct with the price of the key (ignoring the discount)')
    it('should grant discount tokens to the referrer based on the key price')
  })
}
