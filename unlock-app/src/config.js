// There is no standard way to detect the provider name...
export function getCurrentProvider(environment) {
  if (environment.web3.currentProvider.isMetaMask)
    return 'Metamask'

  if (environment.web3.currentProvider.isTrust)
    return 'Trust'

  if (typeof environment.SOFA !== 'undefined')
    return 'Toshi'

  if (typeof environment.__CIPHER__ !== 'undefined')
    return 'Cipher'

  if (environment.web3.currentProvider.constructor.name === 'EthereumProvider')
    return 'Mist'

  if (environment.web3.currentProvider.constructor.name === 'Web3FrameProvider')
    return 'Parity'

  if (environment.web3.currentProvider.host && environment.web3.currentProvider.host.indexOf('infura') !== -1)
    return 'Infura'

  if (environment.web3.currentProvider.host && environment.web3.currentProvider.host.indexOf('localhost') !== -1)
    return 'localhost'

  return 'UnknownProvider'
}

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

  let web3Available = false
  if (typeof environment.web3 !== 'undefined') {
    const provider = environment.web3.currentProvider
    const providerName = getCurrentProvider(environment)
    web3Available = true
    defaultNetworks[providerName] = {
      name: providerName,
      provider,
    }
  }

  let defaultNetwork = 'dev'
  let requiredNetwork = null
  // Let's see if metamask is required.
  if (environment.location.hostname === 'staging.unlock-protocol.com') {
    defaultNetwork = requiredNetwork = 'rinkeby'
  }

  if (defaultNetwork === 'dev') {
    // In dev, we do not need a web3 provider because the local ethereum node has unlocked accounts... so we fake it!
    web3Available = true
  }

  return {
    networks: defaultNetworks,
    web3Available,
    requiredNetwork,
    defaultNetwork,
  }
}
