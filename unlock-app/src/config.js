import getConfig from 'next/config'

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
  runtimeConfig = getConfig().publicRuntimeConfig,
  useWindow = global.window
) {
  const isServer = typeof window === 'undefined'
  const isInIframe = inIframe(useWindow)

  const env = runtimeConfig.unlockEnv

  let googleClientId
  let googleApiKey
  let googleDiscoveryDocs
  let googleScopes

  // Unlock address by default
  // Smart contract deployments yield the same address on a "clean" node as long as long as the
  // migration script runs in the same order.
  const services = {}
  services.storage = {
    host: runtimeConfig.locksmithHost || 'http://127.0.0.1:8080',
  }
  services.wedlocks = {
    host: runtimeConfig.wedlocksUri || 'http://127.0.0.1:1337',
  }

  const { base64WedlocksPublicKey } = runtimeConfig
  let paywallUrl = runtimeConfig.paywallUrl || 'http://localhost:3001'
  let paywallScriptUrl =
    runtimeConfig.paywallScriptUrl ||
    'http://localhost:3001/static/paywall.min.js'
  const unlockStaticUrl =
    runtimeConfig.unlockStaticUrl || 'http://localhost:3002'
  const httpProvider = runtimeConfig.httpProvider || '127.0.0.1'
  let blockTime = 8000 // in mseconds.
  // Publishable key from Stripe dashboard, make sure to use the test key when
  // developing.
  const stripeApiKey =
    runtimeConfig.stripeApiKey || 'pk_test_BHXKmScocCfrQ1oW8HTmnVrB'

  const readOnlyProviderUrl =
    runtimeConfig.readOnlyProvider || `http://${httpProvider}:8545`
  if (env === 'staging') {
    // In staging, the network can only be rinkeby
    paywallUrl = 'https://'
    services.storage = { host: runtimeConfig.locksmithHost }
    services.wedlocks = { host: runtimeConfig.wedlocksUri }
    paywallUrl = runtimeConfig.paywallUrl
    paywallScriptUrl = runtimeConfig.paywallScriptUrl

    // Address for the Unlock smart contract

    // rinkeby block time is roughly same as main net
    blockTime = 8000
  }

  if (env === 'dev-kovan') {
    // In dev-kovan, the network can only be Kovan
    paywallUrl = 'https://'
    services.storage = { host: runtimeConfig.locksmithHost }
    services.wedlocks = { host: runtimeConfig.wedlocksUri }
    paywallUrl = runtimeConfig.paywallUrl
    paywallScriptUrl = runtimeConfig.paywallScriptUrl

    // Address for the Unlock smart contract on Kovan

    // Kovan average block time
    blockTime = 4000
  }

  if (env === 'prod') {
    // In prod, the network can only be mainnet

    services.storage = { host: runtimeConfig.locksmithHost }
    services.wedlocks = { host: runtimeConfig.wedlocksUri }
    paywallUrl = runtimeConfig.paywallUrl
    paywallScriptUrl = runtimeConfig.paywallScriptUrl

    // Address for the Unlock smart contract

    // See https://www.reddit.com/r/ethereum/comments/3c8v2i/what_is_the_expected_block_time/
    blockTime = 8000
  }
  let readOnlyProvider
  if (readOnlyProviderUrl) {
    readOnlyProvider = readOnlyProviderUrl
  }

  const networks = {}

  networks[1984] = {
    httpProvider: runtimeConfig.httpProvider || '127.0.0.1',
    provider: `http://${httpProvider}:8545`,
    unlockAddress: '0x559247Ec8A8771E8C97cDd39b96b9255651E39C5',
    id: 1984,
    name: 'Dev',
    requiredConfirmations: 6,
    blockTime: 3000,
    subgraphURI: 'http://localhost:8000/subgraphs/name/unlock-protocol/unlock',
    explorer: null,
    erc20: {
      symbol: 'DEV',
      address: '0xFcD4FD1B4F3d5ceDdc19004579A5d7039295DBB9',
    },
    baseCurrencySymbol: 'Eth',
    stripeApiKey: 'pk_test_BHXKmScocCfrQ1oW8HTmnVrB',
    locksmith: 'http://127.0.0.1:8080', // TODO: not network specific, API calls should be network specific though
  }

  networks[1] = {
    httpProvider: null, // we use the injected provider!
    provider:
      'https://eth-mainnet.alchemyapi.io/v2/6idtzGwDtRbzil3s6QbYHr2Q_WBfn100',
    unlockAddress: '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13',
    id: 1,
    name: 'Ethereum',
    blockTime: 8000,
    subgraphURI:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock',
    explorer: {
      name: 'Etherscan',
      urls: {
        address: (address) => `https://etherscan.io/address/${address}`,
        transaction: (hash) => `https://etherscan.io/tx/${hash}`,
      },
    },
    erc20: {
      symbol: 'DAI',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    },
    requiredConfirmations: 12,
    baseCurrencySymbol: 'Eth',
    locksmith: 'https://locksmith.unlock-protocol.com', // TODO: not network specific, API calls should be network specific though
  }

  networks[4] = {
    httpProvider,
    provider:
      'https://eth-rinkeby.alchemyapi.io/v2/n0NXRSZ9olpkJUPDLBC00Es75jaqysyT',
    unlockAddress: '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b',
    id: 4,
    name: 'Rinkeby',
    blockTime: 8000,
    subgraphURI:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock-rinkeby',
    explorer: {
      name: 'Etherscan',
      urls: {
        address: (address) => `https://rinkeby.etherscan.io/address/${address}`,
        transaction: (hash) => `https://rinkeby.etherscan.io/tx/${hash}`,
      },
    },
    requiredConfirmations: 12,
    erc20: {
      symbol: 'WEE',
      address: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
    },
    baseCurrencySymbol: 'Eth',
    locksmith: 'https://rinkeby.locksmith.unlock-protocol.com', // TODO: not network specific, API calls should be network specific though
  }

  // networks[3] = {
  //   httpProvider: null, // we use the injected provider!
  //   provider: '',
  //   unlockAddress: '',
  //   id: 3,
  //   name: 'Ropsten',
  //   blockTime: 4000,
  //   subgraphURI:
  //     'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock-ropsten',
  //   explorer: () => {},
  //   erc20: {},
  //   locksmith: '', // TODO: not network specific, API calls should be network specific though
  // }

  // networks[42] = {
  //   httpProvider,
  //   readOnlyProvider,
  //   unlockAddress: '',
  //   id: 42,
  //   name: 'Kovan',
  //   blockTime: 4000,
  //   subgraphURI: '',
  //   explorer: () => {},
  //   erc20: {},
  //   locksmith: '', // TODO: not network specific, API calls should be network specific though
  // }

  networks[100] = {
    httpProvider: null,
    provider: 'https://rpc.xdaichain.com/',
    unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
    id: 100,
    name: 'xDai',
    blockTime: 5000,
    requiredConfirmations: 12,
    subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/xdai',
    explorer: {
      name: 'Blockscout',
      urls: {
        address: (address) =>
          `https://blockscout.com/poa/xdai/address/${address}/transactions`,
        transaction: (hash) => `https://blockscout.com/poa/xdai/tx/${hash}`,
      },
    },
    erc20: null, // no default ERC20 on xdai for now
    locksmith: 'https://locksmith.unlock-protocol.com', // need to fix locksmith to support multiple networks...
    baseCurrencySymbol: 'xDai',
  }

  return {
    requiredConfirmations: 12,
    base64WedlocksPublicKey,
    blockTime,
    isServer,
    isInIframe,
    env,
    httpProvider,
    readOnlyProvider,
    readOnlyProviderUrl, // Used for Unlock accounts
    services,
    paywallUrl,
    paywallScriptUrl,
    unlockStaticUrl,
    stripeApiKey,
    googleClientId,
    googleApiKey,
    googleDiscoveryDocs,
    googleScopes,
    networks,
  }
}
