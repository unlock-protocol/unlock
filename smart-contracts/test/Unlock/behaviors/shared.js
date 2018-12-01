const initialization = require('./initialization')
const computeAvailableDiscountFor = require('./computeAvailableDiscountFor')
const createLock = require('./createLock')
const recordConsumedDiscount = require('./recordConsumedDiscount')
const recordKeyPurchase = require('./recordKeyPurchase')

exports.shouldBehaveLikeV1 = function (accounts, unlockOwner, _logIndex) {
  describe('should behave like v1', function () {
    initialization.shouldHaveInitialized(unlockOwner)
    computeAvailableDiscountFor.shouldComputeAvailableDiscountFor()
    createLock.shouldCreateLock(accounts, _logIndex)
    recordConsumedDiscount.shouldRecordConsumedDiscount()
    recordKeyPurchase.shouldRecordKeyPurchase()
  })
}
