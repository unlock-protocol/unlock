// this is currently used in tests
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

module.exports = {
  getProxyAddress,
}
