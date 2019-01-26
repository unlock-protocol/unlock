import Web3 from 'web3'
import getConfig from 'next/config'
import { ETHEREUM_NETWORKS_NAMES } from './constants'

// TODO: consider moving this to another place
// There is no standard way to detect the provider name...
export function getCurrentProvider(environment) {
  if (
    environment.ethereum &&
    environment.ethereum.constructor.name === 'Object'
  )
    return 'Opera'

  if (environment.web3.currentProvider.isMetaMask) return 'Metamask'

  if (environment.web3.currentProvider.isTrust) return 'Trust'

  if (environment.web3.currentProvider.isToshi) return 'Coinbase Wallet'

  if (environment.web3.currentProvider.isCipher) return 'Cipher'

  if (environment.web3.currentProvider.constructor.name === 'EthereumProvider')
    return 'Mist'

  if (environment.web3.currentProvider.constructor.name === 'Web3FrameProvider')
    return 'Parity'

  if (
    environment.web3.currentProvider.host &&
    environment.web3.currentProvider.host.indexOf('infura') !== -1
  )
    return 'Infura'

  if (
    environment.web3.currentProvider.host &&
    environment.web3.currentProvider.host.indexOf('localhost') !== -1
  )
    return 'localhost'

  return 'UnknownProvider'
}

export const runtimeConfig = {
  unlockEnv: process.env.UNLOCK_ENV || 'dev',
  httpProvider: process.env.HTTP_PROVIDER || '127.0.0.1',
}

/**
 * This function, based on the environment will return the list of providers available, the one that
 * is used, as well as the list of networks and the one that is being used.
 * In dev/testing, the provider can be anything and the network can be anything too.
 * In staging, the provider needs to be an ingested web3 provider, and the network needs to be rinkeby
 * In prod, the provider needs to be an ingested web3 provider and the network needs to be mainnet
 * @param {*} environment (in the JS sense: `window` most likely)
 */
export default function configure(
  environment = global,
  nextConfig = getConfig()
) {
  // Determines if we are running on the server (nextjs) or the browser
  const isServer = typeof window === 'undefined'

  // When not starting thru nextJS
  if (typeof nextConfig === 'undefined') {
    nextConfig = {
      runtimeConfig,
    }
  }

  // Environment, determined UNLOCK_ENV
  const env = nextConfig.runtimeConfig.unlockEnv

  // Default values
  let providers = {}
  let isRequiredNetwork = () => false
  let requiredNetwork = 'Dev'
  let requiredNetworkId = 1984
  let requiredConfirmations = 12
  let unlockAddress = ''
  let services = {}
  let supportedProviders = []

  // Test
  if (env === 'test') {
    // In test, we fake the HTTP provider
    providers['HTTP'] = new Web3.providers.HttpProvider(
      `http://${nextConfig.runtimeConfig.httpProvider}:8545`
    )
    supportedProviders = ['HTTP']
    services['storage'] = { host: 'http://127.0.0.1:8080' }
    isRequiredNetwork = networkId => networkId === 1337
  }

  // Dev
  if (env === 'dev') {
    // In dev, we assume there is a running local ethereum node with unlocked accounts
    // listening to the HTTP endpoint. We can add more providers (Websockets...) if needed.
    providers['HTTP'] = new Web3.providers.HttpProvider(
      `http://${nextConfig.runtimeConfig.httpProvider}:8545`
    )
    services['storage'] = { host: 'http://127.0.0.1:8080' }

    // If there is an existing web3 injected provider, we also add this one to the list of possible providers
    if (typeof environment.web3 !== 'undefined') {
      providers[getCurrentProvider(environment)] =
        environment.web3.currentProvider
    }
    supportedProviders = ['HTTP']

    // In dev, the network can be anything above 100
    isRequiredNetwork = networkId => networkId > 100

    // In dev, we only require 6 confirmation because we only mine when there are pending transactions
    requiredConfirmations = 6
  }

  // Staging
  if (env === 'staging') {
    // In staging, for now, we require a web3 injected provider.
    if (typeof environment.web3 !== 'undefined') {
      providers[getCurrentProvider(environment)] =
        environment.web3.currentProvider
    }

    // In staging, the network can only be rinkeby
    isRequiredNetwork = networkId => networkId === 4
    requiredNetworkId = 4
    supportedProviders = ['Metamask', 'Opera']

    // Address for the Unlock smart contract
    unlockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
  }

  // Production
  if (env === 'prod') {
    // In prod, for now, we require a web3 injected provider.
    if (typeof environment.web3 !== 'undefined') {
      providers[getCurrentProvider(environment)] =
        environment.web3.currentProvider
    }

    // In prod, the network can only be mainnet
    isRequiredNetwork = networkId => networkId === 1
    requiredNetworkId = 1

    supportedProviders = ['Metamask', 'Opera']

    // Address for the Unlock smart contract
    unlockAddress = '0x3d5409cce1d45233de1d4ebdee74b8e004abdd13'
  }

  // Setting up the required Network based on its id
  if (env === 'prod' || env === 'staging') {
    requiredNetwork = ETHEREUM_NETWORKS_NAMES[requiredNetworkId][0]
  }

  return {
    isServer,
    env,
    providers,
    isRequiredNetwork,
    requiredNetworkId,
    requiredNetwork,
    requiredConfirmations,
    unlockAddress,
    services,
    supportedProviders,
  }
}
