import getConfig from 'next/config'

/**
 * @param {*} environment (in the JS sense: `window` most likely)
 */
export default function configure(
  runtimeConfig = getConfig().publicRuntimeConfig,
  useWindow = global.window
) {
  const isServer = typeof window === 'undefined'

  const env = runtimeConfig.unlockEnv

  // Services
  const services = {
    storage: {
      host: runtimeConfig.locksmithHost || 'http://0.0.0.0:8080',
    },
    wedlocks: {
      host: runtimeConfig.wedlocksUri || 'http://127.0.0.1:1337',
    },
  }

  // Email signing
  const { base64WedlocksPublicKey } = runtimeConfig

  // Paywall
  const paywallUrl = runtimeConfig.paywallUrl || 'http://localhost:3001'

  // Static site
  const unlockStaticUrl =
    runtimeConfig.unlockStaticUrl || 'http://localhost:3002'

  // http provider (if there is any)
  const httpProvider = runtimeConfig.httpProvider || '127.0.0.1'

  // Publishable key from Stripe dashboard, make sure to use the test key when developing.
  const stripeApiKey =
    runtimeConfig.stripeApiKey || 'pk_test_BHXKmScocCfrQ1oW8HTmnVrB'

  // Address of the key granter (locksmith) used for credit card purchases and more
  let keyGranter = '0xe29ec42F0b620b1c9A716f79A02E9DC5A5f5F98a'

  if (env === 'staging') {
    // Address for the Unlock credit card purchaser
    keyGranter = '0x903073735Bb6FDB802bd3CDD3b3a2b00C36Bc2A9'
  }

  if (env === 'prod') {
    // Address for the Unlock credit card purchaser
    keyGranter = '0x58b5cede554a39666091f96c8058920df5906581'
  }

  // Network config
  const networks = {}

  // local dev network
  networks[1337] = {
    provider: `http://${httpProvider}:8545`,
    unlockAddress: '0x559247Ec8A8771E8C97cDd39b96b9255651E39C5',
    id: 1337,
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
    locksmith: services.storage.host,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'Eth',
      decimals: 18,
    },
  }

  // mainnet
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
    locksmith: services.storage.host,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'Eth',
      decimals: 18,
    },
  }

  // rinkeby
  networks[4] = {
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
    locksmith: services.storage.host,
    nativeCurrency: {
      name: 'Rinkeby Eth',
      symbol: 'Eth',
      decimals: 18,
    },
  }

  // Matic/Polygon network
  networks[137] = {
    provider: 'https://rpc-mainnet.matic.network',
    unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
    id: 137,
    name: 'Polygon',
    blockTime: 1000,
    subgraphURI:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon',
    explorer: {
      name: 'Polygonscan',
      urls: {
        address: (address) => `https://polygonscan.com/address/${address}`,
        transaction: (hash) => `https://polygonscan.com/tx/${hash}`,
      },
    },
    requiredConfirmations: 12,
    erc20: null,
    baseCurrencySymbol: 'Matic',
    locksmith: services.storage.host,
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
  }

  // xdai network
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
    locksmith: services.storage.host,
    baseCurrencySymbol: 'xDai',
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'xDai',
      decimals: 18,
    },
  }

  return {
    requiredConfirmations: 12,
    base64WedlocksPublicKey,
    isServer,
    env,
    httpProvider,
    services,
    paywallUrl,
    unlockStaticUrl,
    stripeApiKey,
    networks,
    keyGranter,
  }
}
