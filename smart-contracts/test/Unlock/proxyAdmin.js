const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
const { ADDRESS_ZERO } = require('../helpers')
const { reverts } = require('../helpers/errors')

describe('proxyAdmin', () => {
  let unlock

  beforeEach(async () => {
    const Unlock = await ethers.getContractFactory('Unlock')
    const [unlockOwner] = await ethers.getSigners()
    unlock = await upgrades.deployProxy(
      Unlock,
      [await unlockOwner.getAddress()],
      {
        initializer: 'initialize(address)',
      }
    )
  })

  it('is set by default', async () => {
    assert.notEqual(await unlock.proxyAdminAddress(), 0)
  })

  it('should set main contract as ProxyAdmin owner', async () => {
    const Unlock = await ethers.getContractFactory('Unlock')
    const [unlockOwner] = await ethers.getSigners()
    unlock = await upgrades.deployProxy(
      Unlock,
      [await unlockOwner.getAddress()],
      {
        initializer: 'initialize(address)',
      }
    )

    // make sure is has been set
    const proxyAdminAddress = await unlock.proxyAdminAddress()
    const proxyAdmin = await ethers.getContractAt(
      'TestProxyAdmin',
      proxyAdminAddress
    )
    assert.equal(await proxyAdmin.owner(), await unlock.getAddress())
  })

  it('forbid to deploy twice', async () => {
    reverts(unlock.initializeProxyAdmin(), 'ALREADY_DEPLOYED')
  })
})

describe('proxyAdmin unset', () => {
  let unlock
  before(async () => {
    const Unlock = await ethers.getContractFactory('Unlock')
    unlock = await Unlock.deploy()
  })

  it('check ProxyAdmin', async () => {
    const proxyAdmin = await unlock.proxyAdminAddress()
    assert.equal(proxyAdmin, ADDRESS_ZERO)
  })

  it('createUpgradeableLockAtVersion should fail as proxyAdmin is not set', async () => {
    await reverts(
      unlock.createUpgradeableLockAtVersion('0x', 13),
      'Unlock__MISSING_PROXY_ADMIN'
    )
  })

  it('upgradeLock should fail as proxyAdmin is not set', async () => {
    await reverts(
      unlock.upgradeLock(ADDRESS_ZERO, 13),
      'Unlock__MISSING_PROXY_ADMIN'
    )
  })
})
