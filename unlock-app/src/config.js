import { getCurrentProvider } from '@unlock-protocol/unlock-js'

import getConfig from 'next/config'
import { ETHEREUM_NETWORKS_NAMES } from './constants'

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
  let unlockAddress = '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93'
  let services = {}
  let supportedProviders = []
  let base64WedlocksPublicKey = runtimeConfig.base64WedlocksPublicKey
  let paywallUrl = runtimeConfig.paywallUrl || 'http://localhost:3001'
  let paywallScriptUrl =
    runtimeConfig.paywallScriptUrl ||
    'http://localhost:3001/static/paywall.min.js'
  let unlockStaticUrl = runtimeConfig.unlockStaticUrl || 'http://localhost:3002'
  let httpProvider = runtimeConfig.httpProvider || '127.0.0.1'
  let blockTime = 8000 // in mseconds.
  let chainExplorerUrlBuilders = {
    etherScan: () => '',
  }

  services['currencyPriceLookup'] =
    'https://api.coinbase.com/v2/prices/ETH-USD/buy'
  const readOnlyProviderUrl =
    runtimeConfig.readOnlyProvider || `http://${httpProvider}:8545`

  // If there is an existing web3 injected provider, we also add this one to the list of possible providers
  if (typeof environment.web3 !== 'undefined') {
    providers[getCurrentProvider(environment)] =
      environment.web3.currentProvider
  }

  if (env === 'test') {
    // In test, we fake the HTTP provider
    providers['HTTP'] = `http://${httpProvider}:8545`
    blockTime = 10 // in mseconds.
    supportedProviders = ['HTTP']
    services['storage'] = {
      host: runtimeConfig.locksmithHost || 'http://127.0.0.1:8080',
    }
    services['wedlocks'] = {
      host: runtimeConfig.wedlocksUri || 'http://127.0.0.1:1337',
    }
    isRequiredNetwork = networkId => networkId === 1984
  }

  if (env === 'dev') {
    // In dev, we assume there is a running local ethereum node with unlocked accounts
    // listening to the HTTP endpoint. We can add more providers (Websockets...) if needed.
    providers['HTTP'] = `http://${httpProvider}:8545`
    services['storage'] = {
      host: runtimeConfig.locksmithHost || 'http://127.0.0.1:8080',
    }
    services['wedlocks'] = {
      host: runtimeConfig.wedlocksUri || 'http://127.0.0.1:1337',
    }

    supportedProviders = ['HTTP']

    // In dev, we only require 6 confirmation because we only mine when there are pending transactions
    requiredConfirmations = 6

    // we start ganache locally with a block time of 3
    blockTime = 3000
    isRequiredNetwork = networkId => networkId === 1984
  }

  if (env === 'staging') {
    // In staging, the network can only be rinkeby
    isRequiredNetwork = networkId => networkId === 4
    chainExplorerUrlBuilders.etherScan = address =>
      `https://rinkeby.etherscan.io/address/${address}`
    requiredNetworkId = 4
    paywallUrl = 'https://'
    supportedProviders = ['Metamask', 'Opera']
    services['storage'] = { host: runtimeConfig.locksmithHost }
    services['wedlocks'] = { host: runtimeConfig.wedlocksUri }
    paywallUrl = runtimeConfig.paywallUrl
    paywallScriptUrl = runtimeConfig.paywallScriptUrl

    // Address for the Unlock smart contract
    unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

    // rinkeby block time is roughly same as main net
    blockTime = 8000
  }

  if (env === 'prod') {
    // In prod, the network can only be mainnet
    isRequiredNetwork = networkId => networkId === 1
    chainExplorerUrlBuilders.etherScan = address =>
      `https://etherscan.io/address/${address}`
    requiredNetworkId = 1

    supportedProviders = ['Metamask', 'Opera']
    services['storage'] = { host: runtimeConfig.locksmithHost }
    services['wedlocks'] = { host: runtimeConfig.wedlocksUri }
    paywallUrl = runtimeConfig.paywallUrl
    paywallScriptUrl = runtimeConfig.paywallScriptUrl

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
    readOnlyProvider = readOnlyProviderUrl
  }

  return {
    base64WedlocksPublicKey,
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
    unlockStaticUrl,
    chainExplorerUrlBuilders,
  }
}
