// hardhat.config.js
require('hardhat-deploy');
require('hardhat-deploy-ethers');

// for logging
require("hardhat-tracer");

// erc1820 deployment
require("hardhat-erc1820");

require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-web3");
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');

const { 
  supportedNetworks,
  getProviderUrl, 
  getAccounts
} = require('./helpers/network');

const settings = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
}


const networks = {
  localhost: {
    url: "http://127.0.0.1:8545"
  },
  hardhat: {}
}

// parse additional networks and accounts
supportedNetworks.forEach(net => {  
  try {
    const url = getProviderUrl(net)
    const accounts = getAccounts(net)

    if (accounts && url) {
      networks[net] = { 
        url, 
        accounts: {
          'mnemonic': accounts
        }
      }

      console.log(`Added config for ${net}.`)
    }
  } catch (error) { 
    // console.error(error.message)
    // console.log(`skipped.`)
  } 
})
console.log(networks);
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks,
  namedAccounts: {
    unlockOwner: {
      default: 0, // hardhat
      //4 : 0x..., // rinkeby
    },
    minter: {
      default: 1
    },
    proxyAdmin: {
      default: 9
    }
  },
  solidity: {
    compilers: [
      { version: '0.5.17', settings },
      { version: '0.6.12', settings },
      { version: '0.7.6', settings },
      { version: '0.8.4', settings }
    ]
  }
}