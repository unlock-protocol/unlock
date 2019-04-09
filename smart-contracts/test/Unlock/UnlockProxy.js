const Zos = require('zos')
const { ZWeb3, Contracts } = require('zos-lib')

const TestHelper = Zos.TestHelper
const shared = require('./behaviors/shared')

ZWeb3.initialize(web3.currentProvider)
const Unlock = Contracts.getFromLocal('Unlock')

contract('Unlock / UnlockProxy', function(accounts) {
  const proxyAdmin = accounts[1]
  const unlockOwner = accounts[2]

  beforeEach(async function() {
    // TestHelper retrieves project structure from the zos.json file and deploys everything to the current test network.
    this.project = await TestHelper({ from: proxyAdmin })
    this.proxy = await this.project.createProxy(Unlock, {
      Unlock,
      initMethod: 'initialize',
      initArgs: [unlockOwner],
    })
    this.unlock = await Unlock.at(this.proxy.address)
  })

  describe('should function as a proxy', function() {
    shared.shouldBehaveLikeV1(accounts, unlockOwner)
  })
})
