const Web3 = require('web3')
// See <http://truffleframework.com/docs/advanced/configuration>
// to customize your Truffle configuration!

// Allows us to use ES6 in our migrations and tests. TODO: does this belong here?
require('babel-register')
require('babel-polyfill')

const rinkebyHost = process.env.RINKEBY_HOST
const rinkebyHostUsername = process.env.RINKEBY_HOST_USERNAME
const rinkebyHostPassword = process.env.RINKEBY_HOST_PASSWORD
const rinkebyProviderUrl = `https://${rinkebyHostUsername}:${rinkebyHostPassword}@${rinkebyHost}/`

// When running CI, we connect to the 'ganache' container
const testHost = process.env.CI ? 'ganache' : '127.0.0.1'

module.exports = {
  networks: {
    development: {
      // used for local dev
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ganache: {
      // used for local dev but with the ganache gui
      host: '127.0.0.1',
      port: 8546, // We use ganache-gui and this is its default port
      network_id: '*' // Match any network id
    },
    test: {
      // used to run tests in docker (ci)
      host: testHost,
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: new Web3.providers.HttpProvider(rinkebyProviderUrl),
      network_id: '4' // Network Id for Rinkeby
    }

  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  mocha: {
    useColors: true
  }

}
