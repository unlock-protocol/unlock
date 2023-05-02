import networksConfig from '@unlock-protocol/networks'
import { NetworkConfig, NetworkConfigs } from '@unlock-protocol/types'

const env = process.env.NEXT_PUBLIC_UNLOCK_ENV || 'dev'

const staging = {
  paywallUrl: 'https://staging-paywall.unlock-protocol.com',
  locksmithHost: 'https://staging-locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://staging.unlock-protocol.com',
  wedlocksUri:
    'https://staging-wedlocks.unlock-protocol.com/.netlify/functions/handler',
}

const dev = {
  paywallUrl: process.env.NEXT_PUBLIC_PAYWALL_URL || staging.paywallUrl,
  locksmithHost: process.env.NEXT_PUBLIC_LOCKSMITH_URI || staging.locksmithHost,
  unlockStaticUrl:
    process.env.NEXT_PUBLIC_UNLOCK_STATIC_URL || staging.unlockStaticUrl,
  wedlocksUri: process.env.NEXT_PUBLIC_WEDLOCKS_URI || staging.wedlocksUri,
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
  wedlocksPublicKey: process.env.NEXT_PUBLIC_BASE64_WEDLOCKS_PUBLIC_KEY!,
  stripeApiKey: process.env.NEXT_PUBLIC_STRIPE_KEY!,
  ethPassApiKey: process.env.NEXT_PUBLIC_ETHPASS_KEY!,
  googleMapsApiKey: 'AIzaSyD_mt4bpelB7Dlr7XzfUW9k7b9agbf_iSo',
  httpProvider: process.env.NEXT_PUBLIC_HTTP_PROVIDER || 'localhost',
  locksmithSigners: ['0x58b5CeDE554a39666091F96C8058920dF5906581'], // TODO: cleanup? We use config from networks package!
  networks: Object.keys(networksConfig).reduce<NetworkConfigs>(
    (networks, network) => {
      networks[network] = {
        ...networksConfig[network],
        locksmithUri: app.locksmithHost,
        locksmith: app.locksmithHost,
      } as NetworkConfig
      return networks
    },
    {}
  ),
  defaultNetwork: 137,
  isServer: typeof window === 'undefined',
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
  rpcURL: 'https://rpc.unlock-protocol.com',
  recaptchaKey:
    process.env.NEXT_PUBLIC_CAPTCHA_KEY ||
    '6LfuZF4UAAAAANz9dvVjCxzX-i2w7HOuV5_hq_Ir',
  requiredConfirmations: 12,
  publicLockVersion: 12,
  ...app,
}
