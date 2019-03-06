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

// cribbed from https://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
export function inIframe(window) {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
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
  runtimeConfig = getConfig().publicRuntimeConfig,
  useWindow = global.window
) {
  const isServer = typeof window === 'undefined'
  const isInIframe = inIframe(useWindow)

  const env = runtimeConfig.unlockEnv

  let providers = {}
  let isRequiredNetwork = () => false
  let requiredNetwork = 'Dev'
  let requiredNetworkId = 1984
  let requiredConfirmations = 12
  // Unlock address by default
  // Smart contract deployments yield the same address on a "clean" node as long as long as the
  // migration script runs in the same order.
  let unlockAddress = runtimeConfig.unlockAddress
  let services = {}
  let supportedProviders = []
  let paywallUrl = runtimeConfig.paywallUrl || 'http://localhost:3000/paywall'
  let paywallScriptUrl =
    runtimeConfig.paywallScriptUrl ||
    'http://localhost:3000/static/paywall.min.js'
  let blockTime = 8000 // in mseconds.
  let chainExplorerUrlBuilders = {
    etherScan: () => false,
  }

  services['currencyPriceLookup'] =
    'https://api.coinbase.com/v2/prices/ETH-USD/buy'
  const readOnlyProviderUrl = runtimeConfig.readOnlyProvider

  if (env === 'test') {
    // In test, we fake the HTTP provider
    providers['HTTP'] = new Web3.providers.HttpProvider(
      `http://${runtimeConfig.httpProvider}:8545`
    )
    blockTime = 10 // in mseconds.
    supportedProviders = ['HTTP']
    services['storage'] = { host: 'http://127.0.0.1:8080' }
    isRequiredNetwork = networkId => networkId === 1984
  }

  if (env === 'dev') {
    // In dev, we assume there is a running local ethereum node with unlocked accounts
    // listening to the HTTP endpoint. We can add more providers (Websockets...) if needed.
    providers['HTTP'] = new Web3.providers.HttpProvider(
      `http://${runtimeConfig.httpProvider}:8545`
    )
    services['storage'] = { host: 'http://127.0.0.1:8080' }

    // If there is an existing web3 injected provider, we also add this one to the list of possible providers
    if (typeof environment.web3 !== 'undefined') {
      providers[getCurrentProvider(environment)] =
        environment.web3.currentProvider
    }

    supportedProviders = ['HTTP']

    // In dev, we only require 6 confirmation because we only mine when there are pending transactions
    requiredConfirmations = 6

    // we start ganache locally with a block time of 3
    blockTime = 3000
    isRequiredNetwork = networkId => networkId === 1984
  }

  if (env === 'staging') {
    // In staging, for now, we require a web3 injected provider.
    if (typeof environment.web3 !== 'undefined') {
      providers[getCurrentProvider(environment)] =
        environment.web3.currentProvider
    }

    // In staging, the network can only be rinkeby
    isRequiredNetwork = networkId => networkId === 4
    chainExplorerUrlBuilders.etherScan = address =>
      `https://rinkeby.etherscan.io/address/${address}`
    requiredNetworkId = 4
    paywallUrl = 'https://'
    supportedProviders = ['Metamask', 'Opera']
    services['storage'] = { host: runtimeConfig.locksmithHost }
    paywallUrl =
      runtimeConfig.paywallUrl || 'https://staging.unlock-protocol.com/paywall'
    paywallScriptUrl =
      runtimeConfig.paywallScriptUrl ||
      'https://staging.unlock-protocol.com/static/paywall.min.js'

    // Address for the Unlock smart contract
    unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

    // rinkeby block time is roughly same as main net
    blockTime = 8000
  }

  if (env === 'prod') {
    // In prod, for now, we require a web3 injected provider.
    if (typeof environment.web3 !== 'undefined') {
      providers[getCurrentProvider(environment)] =
        environment.web3.currentProvider
    }

    // In prod, the network can only be mainnet
    isRequiredNetwork = networkId => networkId === 1
    chainExplorerUrlBuilders.etherScan = address =>
      `https://etherscan.io/address/${address}`
    requiredNetworkId = 1

    supportedProviders = ['Metamask', 'Opera']
    services['storage'] = { host: runtimeConfig.locksmithHost }
    paywallUrl =
      runtimeConfig.paywallUrl || 'https://unlock-protocol.com/paywall'
    paywallScriptUrl =
      runtimeConfig.paywallScriptUrl ||
      'https://unlock-protocol.com/static/paywall.min.js'

    // Address for the Unlock smart contract
    unlockAddress = '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13'

    // See https://www.reddit.com/r/ethereum/comments/3c8v2i/what_is_the_expected_block_time/
    blockTime = 8000
  }

  if (env === 'prod' || env === 'staging') {
    requiredNetwork = ETHEREUM_NETWORKS_NAMES[requiredNetworkId][0]
  }

  let readOnlyProvider
  if (readOnlyProviderUrl) {
    readOnlyProvider = new Web3.providers.HttpProvider(readOnlyProviderUrl)
  }

  return {
    blockTime,
    isServer,
    isInIframe,
    env,
    providers,
    isRequiredNetwork,
    readOnlyProvider,
    requiredNetworkId,
    requiredNetwork,
    requiredConfirmations,
    unlockAddress,
    services,
    paywallUrl,
    paywallScriptUrl,
    supportedProviders,
    chainExplorerUrlBuilders,
  }
}
