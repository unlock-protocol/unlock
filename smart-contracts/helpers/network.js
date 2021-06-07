const OZ_SDK_EXPORT = require("../openzeppelin-cli-export.json");
const { deployments } = require('hardhat');

const getProxyAddress = async function (web3, contractName) {
  
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
    const Contract = await deployments.get(`${contractName}_Proxy`)
    return Contract.address
  }
  
  // get proxy address from deprec OpenZeppelin CLI migration data
  // see https://docs.openzeppelin.com/upgrades-plugins/1.x/migrate-from-cli
  const { proxies } = OZ_SDK_EXPORT.networks[network]
  const deployedInstance = proxies[`unlock-protocol/${contractName}`]
  
  return deployedInstance.address
}

const supportedNetworks = ['rinkeby', 'ropsten', 'kovan', 'xdai', 'mainnet'] 

const getProviderUrl = function (networkName) {

  if (!networkName || networkName === '') {
    throw new Error(`an ETH network name is required `);
  }

  if (! supportedNetworks.includes(networkName.toLowerCase())) {
    throw new Error(`ETH network not supported : ${networkName}`);
  }

  if (networkName === 'localhost') {
    return 'http://localhost:8545';
  }

  if (networkName) {
    const uri = process.env[networkName.toUpperCase() + '_PROVIDER_URL'];
    if (uri && uri !== '') {
      return uri;
    }
  }
}

const getMnemonic = function(networkName) {

  if (!networkName || networkName === '') {
    throw new Error(`an ETH network name is required `);
  }

  if (!supportedNetworks.includes(networkName.toLowerCase())) {
    throw new Error(`ETH network not supported : ${networkName}`);
  }

  if (networkName) {
    // ex. process.env.XDAI_PROVIDER_URL
    const mnemonic = require(`./mnemonic.${networkName.toLowerCase()}`) // eslint-disable-line import/no-unresolved

    if (mnemonic && mnemonic !== '') {
      return mnemonic;
    }
  }

  if (process.env.CI === 'true') {
    return 'test test test test test test test test test test test junk';
  }
  
  return mnemonic;
}

const accounts = function ( networkName) {
  const mnemonic = getMnemonic(networkName)
  return mnemonic;
}

module.exports = {
  getProxyAddress,
  getProviderUrl,
  accounts
}
