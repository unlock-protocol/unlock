import Web3 from 'web3'
import getConfig from 'next/config'
import { ETHEREUM_NETWORKS_NAMES } from './constants'

// There is no standard way to detect the provider name...
export function getCurrentProvider(environment) {
  if (
    environment.ethereum &&
    environment.ethereum.constructor.name === 'Object'
  )
    return 'Opera'

  if (environment.web3.currentProvider.isMetaMask) return 'Metamask'

  if (environment.web3.currentProvider.isTrust) return 'Trust'

  if (typeof environment.SOFA !== 'undefined') return 'Toshi'

  if (typeof environment.__CIPHER__ !== 'undefined') return 'Cipher'

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
  runtimeConfig = getConfig().publicRuntimeConfig
) {
  const isServer = typeof window === 'undefined'

  const env = runtimeConfig.unlockEnv

  let providers = {}
  let isRequiredNetwork = () => false
  let requiredNetwork = 'Dev'
  let requiredConfirmations = 12

  if (env === 'test') {
    // In test, we fake the HTTP provider
    providers['HTTP'] = new Web3.providers.HttpProvider(
      `http://${runtimeConfig.httpProvider}:8545`
    )
  }

  if (env === 'dev') {
    // In dev, we assume there is a running local ethereum node with unlocked accounts
    // listening to the HTTP endpoint. We can add more providers (Websockets...) if needed.
    providers['HTTP'] = new Web3.providers.HttpProvider(
      `http://${runtimeConfig.httpProvider}:8545`
    )

    // If there is an existing web3 injected provider, we also add this one to the list of possible providers
    if (typeof environment.web3 !== 'undefined') {
      providers[getCurrentProvider(environment)] =
        environment.web3.currentProvider
    }

    // In dev, the network can be anything above 100
    isRequiredNetwork = networkId => networkId > 100

    // In dev, we only require 6 confirmation because we only mine when there are pending transactions
    requiredConfirmations = 6
  }

  if (env === 'staging') {
    // In staging, for now, we require a web3 injected provider.
    if (typeof environment.web3 !== 'undefined') {
      providers[getCurrentProvider(environment)] =
        environment.web3.currentProvider
    }

    // In staging, the network can only be rinkeby
    isRequiredNetwork = networkId => networkId === 4
    requiredNetwork = ETHEREUM_NETWORKS_NAMES[4][0]
  }

  if (env === 'prod') {
    // In prod, for now, we require a web3 injected provider.
    if (typeof environment.web3 !== 'undefined') {
      providers[getCurrentProvider(environment)] =
        environment.web3.currentProvider
    }

    // In prod, the network can only be mainnet
    isRequiredNetwork = networkId => networkId === 1
    requiredNetwork = ETHEREUM_NETWORKS_NAMES[1][0]
  }

  return {
    isServer,
    env,
    providers,
    isRequiredNetwork,
    requiredNetwork,
    requiredConfirmations,
  }
}
