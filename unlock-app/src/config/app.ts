import networksConfig from '@unlock-protocol/networks'
import { NetworkConfigs } from '@unlock-protocol/types'

const env = process.env.VITE_UNLOCK_ENV

const staging = {
  paywallUrl: 'https://staging-paywall.unlock-protocol.com',
  locksmithHost: 'https://staging-locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://staging.unlock-protocol.com',
  wedlocksUri:
    'https://wedlocks.unlock-protocol.com/.netlify/functions/handler',
}

const dev = {
  paywallUrl: process.env.VITE_PAYWALL_URL || staging.paywallUrl,
  locksmithHost: process.env.VITE_LOCKSMITH_URI || staging.locksmithHost,
  unlockStaticUrl:
    process.env.VITE_UNLOCK_STATIC_URL || staging.unlockStaticUrl,
  wedlocksUri: process.env.VITE_WEDLOCKS_URI || staging.wedlocksUri,
}

const production = {
  locksmithHost: 'https://locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://unlock-protocol.com',
  paywallUrl: 'https://paywall.unlock-protocol.com',
  wedlocksUri:
    'https://wedlocks.unlock-protocol.com/.netlify/functions/handler',
}

function getAppConfig(environment?: string) {
  switch (environment) {
    case 'prod':
      return production
    case 'staging':
      return staging
    default:
      return dev
  }
}

const app = getAppConfig(env)

export const config = {
  env,
  wedlocksPublicKey: process.env.VITE_BASE64_WEDLOCKS_PUBLIC_KEY!,
  stripeApiKey: process.env.VITE_STRIPE_KEY!,
  httpProvider: process.env.VITE_HTTP_PROVIDER || 'localhost',
  networks: Object.keys(networksConfig).reduce<NetworkConfigs>(
    (networks, network) => {
      networks[network] = {
        ...networksConfig[network],
        locksmithUri: app.locksmithHost,
      }
      return networks
    },
    {}
  ),
  isServer: false,
  tagManagerArgs: {
    gtmId: 'GTM-5XL2RNW',
  },
  services: {
    storage: {
      host: app.locksmithHost,
    },
    wedlocks: {
      host: app.wedlocksUri,
    },
  },
  recaptchaKey: '6LfuZF4UAAAAANz9dvVjCxzX-i2w7HOuV5_hq_Ir',
  ...app,
}
