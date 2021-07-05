// this is currently used in tests
const { getDeployment } = require('./deployments')
const { getNetworkName } = require('./network')
const OZ_SDK_EXPORT = require('../openzeppelin-cli-export.json')

const getProxyAddress = async function getProxyAddress(web3, contractName) {
  const chainId = await web3.eth.net.getId()
  const networkName = getNetworkName(chainId)

  // hardhat dev/test env
  if (networkName === 'localhost' || networkName === 'ganache') {
    const deployment = getDeployment(chainId, `${contractName}`)
    return deployment.address
  }

  // TODO: convert OZ CLI migration data to
  // get proxy address from deprec OpenZeppelin CLI migration data
  // see https://docs.openzeppelin.com/upgrades-plugins/1.x/migrate-from-cli
  const { proxies } = OZ_SDK_EXPORT.networks[networkName]
  const deployedInstance = proxies[`unlock-protocol/${contractName}`]

  return deployedInstance.address
}

module.exports = {
  getProxyAddress,
}
