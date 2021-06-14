// this is currently used in tests
const { deployments } = require('hardhat')
const OZ_SDK_EXPORT = require('../openzeppelin-cli-export.json')

const getProxyAddress = async function getProxyAddress(web3, contractName) {
  const _id = await web3.eth.net.getId()

  let network
  switch (_id) {
    case '1':
      network = 'mainnet'
      break
    case '4':
      network = 'rinkeby'
      break
    default:
      network = `dev-${_id}`
  }

  // hardhat dev/test env
  if (network === 'dev-31337') {
    const Contract = await deployments.get(`${contractName}`)
    return Contract.address
  }

  // get proxy address from deprec OpenZeppelin CLI migration data
  // see https://docs.openzeppelin.com/upgrades-plugins/1.x/migrate-from-cli
  const { proxies } = OZ_SDK_EXPORT.networks[network]
  const deployedInstance = proxies[`unlock-protocol/${contractName}`]

  return deployedInstance.address
}

module.exports = {
  getProxyAddress,
}
