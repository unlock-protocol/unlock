const initialization = require('./initialization')
const createLock = require('./createLock')

exports.shouldBehaveLikeV1 = function(accounts, unlockOwner) {
  describe('Unlock / behaviors / shared', () => {
    initialization.shouldHaveInitialized(unlockOwner)
    createLock.shouldCreateLock(accounts)
  })
}
