const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../helpers')

let proxy

describe('KeyManager', () => {
  beforeEach(async () => {
    // deploy proxy
    const KeyManager = await ethers.getContractFactory('KeyManager')
    proxy = await upgrades.deployProxy(KeyManager)
  })

  it('should be upgradable by the owner only', async () => {
    const KeyManagerV2 = await ethers.getContractFactory('KeyManagerV2')

    // We attach before so we are able to use the "new" ABI, on the proxy before
    const proxyBefore = KeyManagerV2.attach(await proxy.getAddress())
    // This should not work as someNewFeature is in the new version
    await reverts(proxyBefore.someNewFeature())

    // upgrade through proxy
    const afterProxy = await upgrades.upgradeProxy(
      await proxy.getAddress(),
      KeyManagerV2
    )

    // This should now work!
    await afterProxy.someNewFeature()
  })

  it('should not be upgradable by an attacker', async () => {
    const [, , , attacker] = await ethers.getSigners()
    const KeyManagerV2 = await ethers.getContractFactory(
      'KeyManagerV2',
      attacker
    )

    // the `reverts` helper does not seem to work here.
    try {
      await upgrades.upgradeProxy(await proxy.getAddress(), KeyManagerV2)
      assert.equal(false, 'to have reverted')
    } catch (error) {
      const interface = new ethers.Interface([
        'error OwnableUnauthorizedAccount(address)',
      ])
      // whatever comes after `return data:` flag in erro message is error bytes
      const errordata = error.message.split('return data:')[1].slice(1, -1)
      const encodedError = interface.encodeErrorResult(
        'OwnableUnauthorizedAccount',
        [await attacker.getAddress()]
      )
      assert.equal(errordata, encodedError)
    }
  })
})
