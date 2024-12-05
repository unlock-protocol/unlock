/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomicfoundation/hardhat-ethers')

module.exports = {
  solidity: {
    version: '0.8.21',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
      evmVersion: 'shanghai',
    },
  },
}
