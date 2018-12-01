process.env.NODE_ENV = 'test'

const Unlock = artifacts.require('./Unlock.sol')
const TestHelper = require('zos').TestHelper
const shared = require('./behaviors/shared')

contract('Unlock', (accounts) => {
  const proxyAdmin = accounts[1]
  const unlockOwner = accounts[2]
  describe('Standard Unlock contract', function () {
    beforeEach(async function () {
      const project = await TestHelper({ from: proxyAdmin })
      const proxy = await project.createProxy(Unlock, { initMethod: 'initialize', initArgs: [unlockOwner], initFrom: unlockOwner })
      this.unlock = await Unlock.at(proxy.address)
    })
    // needed to retrieve the correct addresses for the newly created publicLocks in 2 tests in createLock.js. Each of the 2 tests is called twice, and since the move to using the zos.TestHelper in UnlockProxy.js, both times these tests are called, the log index of the correct args.newLockAddress is different. With refactoring of tests this can most likely be removed.
    let _logIndex = 0
    shared.shouldBehaveLikeV1(accounts, unlockOwner, _logIndex)
  })
})
