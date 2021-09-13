// hardhat.config.js
require('@nomiclabs/hardhat-ethers')

// erc1820 deployment
require('hardhat-erc1820')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */


// TODO: bring back blocktime arg
module.exports = {
  networks: {
    hardhat: {
      accounts: {
        chainId: 31337,
        mnemonic: 'hello unlock save the web',
      },
    },
  }
};
