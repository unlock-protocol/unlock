const { ethers, upgrades } = require('hardhat')
const { reverts } = require('truffle-assertions')

contract('proxyAdmin', () => {
  let unlock

  beforeEach(async () => {
    const Unlock = await ethers.getContractFactory('Unlock')
    const [unlockOwner] = await ethers.getSigners()
    unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
      initializer: 'initialize(address)',
    })
    await unlock.deployed()
  })

  it('is not set by default', async () => {
    assert.equal(await unlock.proxyAdminAddress(), 0)
  })

  it('should set main contract as ProxyAdmin owner', async () => {
    // instantiate proxyAdmin
    const tx = await unlock.initializeProxyAdmin()
    const { logs } = await tx.wait()
    const newProxyAdminAddress = logs[0].address

    // make sure is has been set
    const proxyAdminAddress = await unlock.proxyAdminAddress()
    assert.equal(newProxyAdminAddress, proxyAdminAddress)

    // check if
    const proxyAdmin = await ethers.getContractAt(
      'TestProxyAdmin',
      proxyAdminAddress
    )
    assert.equal(await proxyAdmin.owner(), unlock.address)
  })

  it('forbid to deploy twice', async () => {
    const tx = await unlock.initializeProxyAdmin()
    await tx.wait()
    reverts(unlock.initializeProxyAdmin(), 'ProxyAdmin already deployed')
  })
})
