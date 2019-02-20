const deployLocks = require('../../helpers/deployLocks')

exports.shouldComputeAvailableDiscountFor = function () {
  describe('computeAvailableDiscountFor', function () {
    beforeEach(async function () {
      await deployLocks(this.unlock)
    })

    it('should return the eth amount of discount as well as the number of tokens used to claim that discount')
  })
}
