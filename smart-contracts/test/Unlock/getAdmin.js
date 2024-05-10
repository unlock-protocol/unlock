const { assert } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { deployContracts, getProxyAdminAddress } = require('../helpers')

describe('Unlock / getAdmin', () => {
  it('fetched correctly the proxy admin address', async () => {
    const { unlock } = await deployContracts()
    const admin = await unlock.getAdmin()

    // get instance from OZ plugin
    const proxyAdminAddress = await upgrades.erc1967.getAdminAddress(
      await unlock.getAddress()
    )
    assert.equal(proxyAdminAddress, admin)

    // make sure it matches with address from storage
    assert.equal(
      (await getProxyAdminAddress(await unlock.getAddress())).toLowerCase(),
      admin.toLowerCase()
    )

    // change unlock proxyAdmin
    const ProxyAdminFactory = await ethers.getContractFactory(
      'contracts/utils/UnlockProxyAdmin.sol:ProxyAdmin'
    )
    const newProxyAdmin = await ProxyAdminFactory.deploy()
    await upgrades.admin.changeProxyAdmin(
      await unlock.getAddress(),
      await newProxyAdmin.getAddress()
    )
    assert.equal(await unlock.getAdmin(), newProxyAdmin)
  })
})
