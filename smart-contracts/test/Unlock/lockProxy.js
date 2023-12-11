const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../helpers/errors')
const {
  ADDRESS_ZERO,
  createLockCalldata,
} = require('@unlock-protocol/hardhat-helpers')

contract('lockProxyAddress', () => {
  let unlock, proxy
  let unlockOwner, lockOwner, rando

  beforeEach(async () => {
    // deploy unlock
    const Unlock = await ethers.getContractFactory('Unlock')
    ;[unlockOwner, lockOwner, rando] = await ethers.getSigners()
    unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
      initializer: 'initialize(address)',
    })

    // deploy template
    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    const template = await PublicLock.deploy()

    // deploy proxy with some lock args
    const args = [
      60 * 60 * 24 * 30,
      ADDRESS_ZERO,
      ethers.utils.parseEther('0.01'),
      '10',
      'Test lock',
    ]

    const calldata = await createLockCalldata({ args, from: lockOwner.address })

    // deploy proxyAdmin
    const TestProxyAdmin = await ethers.getContractFactory('TestProxyAdmin')
    const proxyAdmin = await TestProxyAdmin.deploy()
    console.log(proxyAdmin)

    console.table({
      unlockAddress: unlock.address,
      publicLockAddress: template.address,
      proxyAdminAddress: proxyAdmin.address,
      args,
      calldata,
    })

    // // deploy standalone proxy
    const TestLockProxy = await ethers.getContractFactory(
      '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy'
    )
    proxy = await TestLockProxy.deploy(
      template.address,
      proxyAdmin.address,
      calldata
    )
  })

  it('is not set by default', async () => {
    assert.equal(await unlock.lockProxyAddress(), ADDRESS_ZERO)
  })

  describe('setLockProxyAddress', async () => {
    it('set correctly an address', async () => {
      await unlock.setLockProxyAddress(proxy.address)
      assert.equal(await unlock.lockProxyAddress(), proxy.address)
    })

    it('forbid to set an address with no code', async () => {
      await reverts(
        unlock.setLockProxyAddress(rando.address),
        'Unlock__MISSING_LOCK_PROXY'
      )
    })

    it('forbid to deploy if not owner', async () => {
      await reverts(
        unlock.connect(rando).setLockProxyAddress(proxy.address),
        'ONLY_OWNER'
      )
    })
  })
})
