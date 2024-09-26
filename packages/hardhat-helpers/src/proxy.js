const { Manifest } = require('@openzeppelin/upgrades-core')

const getProxyAdminAddress = async ({ chainId }) => {
  // get proxy admin address from OZ manifest

  const manifest = new Manifest(chainId)
  const manifestAdmin = await manifest.getAdmin()
  const proxyAdminAddress = await manifestAdmin.getAddress()
  if (proxyAdminAddress === undefined) {
    throw new Error('No ProxyAdmin was found in the network manifest')
  }
  return proxyAdminAddress
}

export default {
  getProxyAdminAddress,
}
