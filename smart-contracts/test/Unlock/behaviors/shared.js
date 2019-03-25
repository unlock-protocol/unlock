const initialization = require('./initialization')
const computeAvailableDiscountFor = require('./computeAvailableDiscountFor')
const createLock = require('./createLock')
const recordConsumedDiscount = require('./recordConsumedDiscount')
const recordKeyPurchase = require('./recordKeyPurchase')

exports.shouldBehaveLikeV1 = function(accounts, unlockOwner) {
  describe('Unlock / behaviors / shared', function() {
    initialization.shouldHaveInitialized(unlockOwner)
    computeAvailableDiscountFor.shouldComputeAvailableDiscountFor(accounts)
    createLock.shouldCreateLock(accounts)
    recordConsumedDiscount.shouldRecordConsumedDiscount(accounts)
    recordKeyPurchase.shouldRecordKeyPurchase(accounts)
  })
}
