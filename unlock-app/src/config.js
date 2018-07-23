export default function config(environment) {
  let defaultNetworks = {
    dev: {
      url: 'ws://127.0.0.1:8545',
      name: 'Development',
      protocol: 'ws', // couldn't we extract that from url?
    },
    test: {
      url: 'http://127.0.0.1:8545',
      name: 'Test',
      protocol: 'http', // couldn't we extract that from url?

    },
    ganache: {
      url: 'ws://127.0.0.1:8546',
      name: 'Ganache',
      protocol: 'ws', // couldn't we extract that from url?
    },
  }

  let metamaskAvailable = false
  // Let's see if web3 is defined thru metamask
  // and eventually add that as an option!
  if (typeof environment.web3 !== 'undefined') {
    const provider = environment.web3.currentProvider
    if (provider.isMetaMask) {
      metamaskAvailable = true
      defaultNetworks.metamask = {
        name: 'Metamask',
        provider,
      }
    }
  }

  let defaultNetwork = 'dev'
  // Let's see if metamask is required.
  if (environment.location.hostname === 'staging.unlock-protocol.com') {
    defaultNetwork = 'metamask'
  }

  let metamaskRequired = (defaultNetwork === 'metamask')

  return {
    networks: defaultNetworks,
    metamaskAvailable,
    metamaskRequired,
    defaultNetwork,
  }
}
