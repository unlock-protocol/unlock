process.env.NODE_ENV = 'test'

const Unlock = artifacts.require('./Unlock.sol')
const Zos = require('zos')
const TestHelper = Zos.TestHelper
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
    shared.shouldBehaveLikeV1(accounts, unlockOwner)
  })
})
