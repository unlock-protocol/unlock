const deployLocks = require('../../helpers/deployLocks')

exports.shouldComputeAvailableDiscountFor = function () {
  describe('computeAvailableDiscountFor', function () {
    let locks

    beforeEach(async function () {
      locks = await deployLocks(this.unlock)
    })

    it('should return the eth amount of discount as well as the number of tokens used to claim that discount')
  })
}
