export const networks = {
  dev: {
    url: 'ws://127.0.0.1:8545',
    name: 'Development',
    protocol: 'ws', // couldn't we extract that from url?
    unlock: '',
  },
  ganache: {
    url: 'ws://127.0.0.1:8546',
    name: 'Ganache',
    protocol: 'ws', // couldn't we extract that from url?
    unlock: '',
  },
  rinkeby: {
    url: 'https://rinkeby.infura.io/DP8aTF8zko71UQIAe1NV ',
    name: 'Rinkeby',
    protocol: 'http', // couldn't we extract that from url?
    unlock: '',
  },
}
