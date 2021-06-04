require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');

const settings = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      { version: '0.5.17', settings },
      { version: '0.6.12', settings },
      { version: '0.7.6', settings },
      { version: '0.8.4', settings },
    ],
  },
}
