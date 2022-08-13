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

  const recaptchaKey = '6LfuZF4UAAAAANz9dvVjCxzX-i2w7HOuV5_hq_Ir'

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

  // Network config
  const networks = {}

  // add locksmithURL
  Object.keys(networksConfig).map((chainId) => {
    networks[chainId] = {
      ...networksConfig[chainId],
      locksmith: services.storage.host,
    }
  })

  // List of locksmith signers
  const locksmithSigners = ['0x58b5CeDE554a39666091F96C8058920dF5906581']

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
    recaptchaKey,
    locksmithSigners,
  }
}
