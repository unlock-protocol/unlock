const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
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
