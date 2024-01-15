const { Manifest } = require('@openzeppelin/upgrades-core')

const getProxyAdminAddress = async ({ network }) => {
  // get proxy admin address from OZ manifest
  const manifest = await Manifest.forNetwork(network.provider)
  const manifestAdmin = await manifest.getAdmin()
  const proxyAdminAddress = manifestAdmin.address
  if (proxyAdminAddress === undefined) {
    throw new Error('No ProxyAdmin was found in the network manifest')
  }
  return proxyAdminAddress
}

export default {
  getProxyAdminAddress,
}
