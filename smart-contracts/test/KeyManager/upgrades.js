const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../helpers')


let proxy

contract('KeyManager', (accounts) => {

  beforeEach(async () => {
    // deploy proxy
    const KeyManager = await ethers.getContractFactory('KeyManager')
    proxy = await upgrades.deployProxy(KeyManager)
  })

  it('should be upgradable by the owner only', async () => {
    const KeyManagerV2 = await ethers.getContractFactory('KeyManagerV2')

    // We attach before so we are able to use the "new" ABI, on the proxy before
    const proxyBefore = KeyManagerV2.attach(proxy.address)
    // This should not work as someNewFeature is in the new version
    await reverts(proxyBefore.someNewFeature())

    // upgrade through proxy
    const afterProxy = await upgrades.upgradeProxy(proxy.address, KeyManagerV2)

    // This should now work!
    await afterProxy.someNewFeature()
  })

  it('should not be upgradable by an attacker', async () => {
    const attacker = await ethers.getSigner(accounts[3])
    const KeyManagerV2 = await ethers.getContractFactory('KeyManagerV2', attacker)

    // the `reverts` helper does not seem to work here.
    try {
      await upgrades.upgradeProxy(proxy.address, KeyManagerV2)
      expect(false, 'to have reverted')
    } catch (error) {
      expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'")
    }
  })
})
