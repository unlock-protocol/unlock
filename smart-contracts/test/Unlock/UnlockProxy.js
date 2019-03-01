const Unlock = artifacts.require('Unlock')
const Zos = require('zos')
const TestHelper = Zos.TestHelper
const shouldFail = require('../helpers/shouldFail')
const shared = require('./behaviors/shared')

contract('Unlock', function (accounts) {
  const proxyAdmin = accounts[1]
  const unlockOwner = accounts[2]

  describe('Proxy Unlock contract', function () {
    beforeEach(async function () {
      // TestHelper retrieves project structure from the zos.json file and deploys everything to the current test network.
      this.project = await TestHelper({ from: proxyAdmin })
      this.proxy = await this.project.createProxy(Unlock, {
        Unlock,
        initMethod: 'initialize',
        initArgs: [unlockOwner]
      })
      this.unlock = await Unlock.at(this.proxy.address)
    })

    describe('should function as a proxy', function () {
      shared.shouldBehaveLikeV1(accounts, unlockOwner)

      it("should fail if called from the proxy owner's account", async function () {
        await shouldFail(this.unlock.grossNetworkProduct({ from: proxyAdmin }), 'Cannot call fallback function from the proxy admin')
      })
    })
  })
})
