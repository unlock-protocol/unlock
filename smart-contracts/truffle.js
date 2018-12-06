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
      host: 'ganache', // This is because we use docker-compose and that is the name of the service which runs ganache
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      // used to run tests in docker (ci)
      host: '127.0.0.1', // This will require us to deploy from a running geth node connected to rinkeby (see docs)
      port: 8545,
      from: '0x3ca206264762caf81a8f0a843bbb850987b41e16', // Account which has a positive of eth
      network_id: '4', // Network Id for Rinkeby
      gas: 4712388,
      gasPrice: 5000000000
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
