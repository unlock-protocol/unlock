// See <http://truffleframework.com/docs/advanced/configuration>
// to customize your Truffle configuration!

// Allows us to use ES6 in our migrations and tests. TODO: does this belong here?
require('babel-register')
require('babel-polyfill')

module.exports = {
  networks: {
    development: {
      // used for local dev
      host: '127.0.0.1',
      port: 8545, // We use ganache-cli and this is its default port
      network_id: '*' // Match any network id
    },
    ganache: {
      // used for local dev but with the ganache gui
      host: '127.0.0.1',
      port: 8546, // We use ganache-cli and this is its default port
      network_id: '*' // Match any network id
    },
    test: {
      // used to run tests in docker (ci)
      host: 'ganache', // This is because we use docker-compose and that is the name of the service which runs ganache
      port: 8545, // We use ganache-cli and this is its default port
      network_id: '*' // Match any network id
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
