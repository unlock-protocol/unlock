import networksConfig from '@unlock-protocol/networks'
import { NetworkConfigs } from '@unlock-protocol/types'

const env = process.env.NEXT_PUBLIC_UNLOCK_ENV || 'dev'

const staging = {
  paywallUrl: 'https://staging-paywall.unlock-protocol.com',
  locksmithHost: 'https://staging-locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://staging.unlock-protocol.com',
  wedlocksUri:
    'https://staging-wedlocks.unlock-protocol.com/.netlify/functions/handler',
  unlockApp: 'https://staging-app.unlock-protocol.com',
  googleClientId:
    '801850414021-kk4m4gqm7imtggonhl57tfsj512on6s6.apps.googleusercontent.com',
  // https://portal.cdp.coinbase.com/projects
  coinbaseProjectId: '4e90fd0f-bb62-4e1c-91a4-f08c76d1b09e',
  prime: {
    network: 84532,
    contract: '0xB37D532429940f3C59DA0aed4D0692bFfa9AF316',
  },
  privyAppId: 'cm2oqudm203nny8z9ho6chvyv',
}

const dev = {
  paywallUrl: process.env.NEXT_PUBLIC_PAYWALL_URL || staging.paywallUrl,
  locksmithHost: process.env.NEXT_PUBLIC_LOCKSMITH_URI || staging.locksmithHost,
  unlockStaticUrl:
    process.env.NEXT_PUBLIC_UNLOCK_STATIC_URL || staging.unlockStaticUrl,
  wedlocksUri: process.env.NEXT_PUBLIC_WEDLOCKS_URI || staging.wedlocksUri,
  unlockApp: process.env.NEXT_PUBLIC_UNLOCK_APP_URI || staging.unlockApp,
  googleClientId:
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || staging.googleClientId,
  coinbaseProjectId:
    process.env.NEXT_PUBLIC_COINBASE_PROJECT_ID || staging.coinbaseProjectId,
  prime: {
    network: 84532,
    contract: '0xB37D532429940f3C59DA0aed4D0692bFfa9AF316',
  },
  privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || staging.privyAppId,
}

const production = {
  locksmithHost: 'https://locksmith.unlock-protocol.com',
  unlockStaticUrl: 'https://unlock-protocol.com',
  paywallUrl: 'https://paywall.unlock-protocol.com',
  wedlocksUri:
    'https://wedlocks.unlock-protocol.com/.netlify/functions/handler',
  unlockApp: 'https://app.unlock-protocol.com',
  googleClientId:
    '801850414021-sonqmfqhulumuoj4oab1it3e15ntsk04.apps.googleusercontent.com',
  // https://portal.cdp.coinbase.com/projects
  coinbaseProjectId: '4e90fd0f-bb62-4e1c-91a4-f08c76d1b09e',
  prime: {
    network: 8453,
    contract: '0x01D8412eE898A74cE44187F4877Bf9303E3C16e5',
  },
  privyAppId: 'cm0ptl8td04urb29fpotv9q9y',
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
  ethPassApiKey: 'sk_live_h0pHRAZ2E6WTkNIrXvEzbEQN39Ftrp1p',
  walletConnectApiKey: '1535029cc7500ace23802e2e990c58d7', // https://cloud.walletconnect.com/app/project?uuid=7920be27-1e19-43a8-8f7d-cafbb00d4b80
  googleMapsApiKey: 'AIzaSyDp0Y4yQn6WtYEFEgRZg52EiDSgLwxzVMA',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET, // https://console.cloud.google.com/apis/dashboard
  nexthAuthSecret:
    process.env.NEXTAUTH_SECRET || 'bf6c743902383e5db35edba7cfe0a489',
  httpProvider: process.env.NEXT_PUBLIC_HTTP_PROVIDER || 'localhost',
  locksmithSigners: [
    '0x58b5CeDE554a39666091F96C8058920dF5906581',
    '0x22c095c69c38b66afAad4eFd4280D94Ec9D12f4C',
    '0xd851fe9ba8EfA66e65d7865690bD2B9522C6E99f', // OZ Relay
  ], // TODO: cleanup? We should use config from networks package!
  networks: Object.keys(networksConfig).reduce<NetworkConfigs>(
    (networks, network) => {
      networks[network] = networksConfig[network]
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
  ...app,
}
