const { upgrades } = require('hardhat')
const { deployContracts, getProxyAdminAddress } = require('../helpers')

contract('Unlock / getAdmin', () => {
  it('fetched correctly the proxy admin address', async () => {
    const { unlock } = await deployContracts()
    const admin = await unlock.getAdmin()

    // get instance from OZ plugin
    const proxyAdmin = await upgrades.admin.getInstance()
    assert.equal(proxyAdmin.address, admin)

    // make sure it matches with address from storage
    assert.equal(
      (await getProxyAdminAddress(unlock.address)).toLowerCase(),
      admin.toLowerCase()
    )

    // change unlock proxyAdmin
    const newProxyAdmin = await upgrades.deployProxyAdmin()
    await proxyAdmin.changeProxyAdmin(unlock.address, newProxyAdmin)
    assert.equal(await unlock.getAdmin(), newProxyAdmin)
  })
})
