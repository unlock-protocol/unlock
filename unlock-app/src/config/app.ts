import networksConfig from '@unlock-protocol/networks'
import { NetworkConfig, NetworkConfigs } from '@unlock-protocol/types'

const env = process.env.NEXT_PUBLIC_UNLOCK_ENV || 'dev'

const staging = {
  paywallUrl: 'https://staging-paywall.unlock-protocol.com',
  locksmithHost: 'https://staging-locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://staging.unlock-protocol.com',
  wedlocksUri:
    'https://staging-wedlocks.unlock-protocol.com/.netlify/functions/handler',
  unlockApp: 'https://staging-app.unlock-protocol.com',
}

const dev = {
  paywallUrl: process.env.NEXT_PUBLIC_PAYWALL_URL || staging.paywallUrl,
  locksmithHost: process.env.NEXT_PUBLIC_LOCKSMITH_URI || staging.locksmithHost,
  unlockStaticUrl:
    process.env.NEXT_PUBLIC_UNLOCK_STATIC_URL || staging.unlockStaticUrl,
  wedlocksUri: process.env.NEXT_PUBLIC_WEDLOCKS_URI || staging.wedlocksUri,
  unlockApp: process.env.NEXT_PUBLIC_UNLOCK_APP_URI || staging.unlockApp,
}

const production = {
  locksmithHost: 'https://locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://unlock-protocol.com',
  paywallUrl: 'https://paywall.unlock-protocol.com',
  wedlocksUri:
    'https://wedlocks.unlock-protocol.com/.netlify/functions/handler',
  unlockApp: 'https://app.unlock-protocol.com',
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
  wedlocksPublicKey:
    'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0NCk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBbzdTYXhDZDg3YnQ0SFZ4anhXbkkNClFOTGFhZVdqb1ptbFNxcGhkL1JCbDNzNGQrcENnZHl3YUJBdGRqVENMQXBzakN6SzFqZWZLVWZmbXhqbW15NGUNCnFHRHN2ekZBazRUS1ZrM0g4ZTJrYnJpNHdoZjNaU1V4d2gyL2c2WWgrRzFuK1F2cWJ0ZGwvOVUvcnJ5SmR5NFENCmt6K2tJMzBsRk9aNHJCMHJ5bldvdDZuZGtISUVlMDFhQThzYWpSb1ZrZitDb1RFZ1hWNlowd2gzSlRNc01FUEENCk8rc2FGYkVaZlI4Y1lMNEVVanB1Ty9WUXZyZk1nVDRiQUxLQXVrV1hweGZWZDNWTVlNallQeU52KzUwRTFRR2UNClZYN0xtYUR6ZmhuQlhTbG4zU01mYncvTWl2cExoR3RlQ0NIN0JYaU8zb1hQUFpVd3ZIT3BzTm1OS2F6dEx4OG4NCmF3SURBUUFCDQotLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0NCg==',
  stripeApiKey:
    process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_test_BHXKmScocCfrQ1oW8HTmnVrB',
  ethPassApiKey: 'pk_live_Th4KfDH9DZw0cuHcWzyUFBgAeHEl0MoK',
  walletConnectApiKey: '1535029cc7500ace23802e2e990c58d7', // https://cloud.walletconnect.com/app/project?uuid=7920be27-1e19-43a8-8f7d-cafbb00d4b80
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
