import getConfig from 'next/config'
import networksConfig from '@unlock-protocol/networks'

/**
 * @param {*} environment (in the JS sense: `window` most likely)
 */
export default function configure(
  runtimeConfig = getConfig().publicRuntimeConfig,
  useWindow = global.window
) {
  const isServer = typeof window === 'undefined'

  const tagManagerArgs = {
    gtmId: 'GTM-5XL2RNW',
  }

  const env = runtimeConfig.unlockEnv

  // Services
  const services = {
    storage: {
      host: runtimeConfig.locksmithHost || 'http://localhost:8080',
    },
    wedlocks: {
      host: runtimeConfig.wedlocksUri || 'http://localhost:1337',
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
  const httpProvider = runtimeConfig.httpProvider || 'localhost'

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

  // add locksmithURL
  Object.keys(networksConfig).map((chainId) => {
    networks[chainId] = {
      ...networksConfig[chainId],
      locksmith: services.storage.host,
    }
  })

  return {
    tagManagerArgs,
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
