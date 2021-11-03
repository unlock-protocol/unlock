// this is currently used in tests
const { Manifest } = require('@openzeppelin/upgrades-core')
const { getDeployment } = require('./deployments')
const { getNetworkName } = require('./network')
const OZ_SDK_EXPORT = require('../openzeppelin-cli-export.json')

const getProxyAddress = function getProxyAddress(chainId, contractName) {
  const networkName = getNetworkName(chainId)

  // hardhat dev/test env
  if (networkName === 'localhost' || networkName === 'ganache') {
    const deployment = getDeployment(chainId, `${contractName}`)
    return deployment.address
  }

  const { proxies } = OZ_SDK_EXPORT.networks[networkName]
  const [proxy] = proxies[`unlock-protocol/${contractName.replace('V2', '')}`]
  const { address } = proxy

  if (!address) {
    throw new Error(
      `The proxy address for ${contractName} was not found in the network manifest (chainId: ${chainId})`
    )
  }

  return address
}

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

module.exports = {
  getProxyAddress,
  getProxyAdminAddress,
}
