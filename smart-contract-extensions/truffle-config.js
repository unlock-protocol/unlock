const testHost = process.env.CI ? 'ganache' : '127.0.0.1'

module.exports = {
  networks: {
    development: {
      gas: 6721974,
      host: testHost,
      port: 8545,
      network_id: '*',
    },
    tenderly: {
      host: '127.0.0.1',
      port: 9545,
      network_id: '*',
      gasPrice: 0,
    },
  },
  compilers: {
    solc: {
      version: '0.5.16',
      settings: {
        optimizer: {
          enabled: true,
          runs: 2000000,
        },
      },
    },
  },
  plugins: ['solidity-coverage'],
  mocha: {
    reporter: 'eth-gas-reporter',
    useColors: true,
    reporterOptions: {
      currency: 'USD',
      excludeContracts: ['Migrations'],
      gasPrice: 5,
    },
  },
}
