let defaultNetworks = {
  dev: {
    url: 'ws://127.0.0.1:8545',
    name: 'Development',
    protocol: 'ws', // couldn't we extract that from url?
    unlock: '',
  },
  test: {
    url: 'http://127.0.0.1:8545',
    name: 'Test',
    protocol: 'http', // couldn't we extract that from url?
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

let metamaskAvailable = false
// Let's see if web3 is defined thru metamask
// and eventually add that as an option!
if (typeof window.web3 !== 'undefined') {
  const provider = window.web3.currentProvider
  if (provider.isMetaMask) {
    metamaskAvailable = true
    defaultNetworks.metamask = {
      name: 'Metamask',
      provider,
    }
  }
}

let metamaskRequired = true
// Let's see if metamask is required.
if (window.location.hostname === 'staging.unlock-protocol.com') {
  metamaskRequired = true
}

export const networks = defaultNetworks
export {
  metamaskAvailable,
  metamaskRequired,
}