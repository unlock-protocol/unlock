import '../utils/envLoader'
import { Options } from 'sequelize'
import networks from '@unlock-protocol/networks'

export const isProduction = ['prod'].includes(
  process.env.UNLOCK_ENV?.toLowerCase().trim() ?? ''
)

export const isStaging = ['staging'].includes(
  process.env.UNLOCK_ENV?.toLowerCase().trim() ?? ''
)

const stagingConfig = {
  storage: {
    publicHost: 'https://staging-storage.unlock-protocol.com',
  },
  unlockApp: 'https://staging-app.unlock-protocol.com',
  services: {
    wedlocks:
      'https://staging-wedlocks.unlock-protocol.com/.netlify/functions/handler',
    locksmith: 'https://staging-locksmith.unlock-protocol.com',
  },
}

const prodConfig = {
  storage: {
    publicHost: 'https://storage.unlock-protocol.com',
  },
  services: {
    wedlocks: 'https://wedlocks.unlock-protocol.com/.netlify/functions/handler',
    locksmith: 'https://locksmith.unlock-protocol.com',
  },
  unlockApp: 'https://app.unlock-protocol.com',
}

const defaultConfig = isProduction ? prodConfig : stagingConfig

interface DefenderRelayCredentials {
  [network: number]: {
    relayerApiKey: string
    relayerApiSecret: string
  }
}

// Interface for Google API credentials
interface GoogleWalletCredentials {
  client_email: string
  private_key: string
}

const defenderRelayCredentials: DefenderRelayCredentials = {}
Object.values(networks).forEach((network) => {
  defenderRelayCredentials[network.id] = {
    relayerApiKey: process.env[`DEFENDER_RELAY_KEY_${network.id}`] || '',
    relayerApiSecret: process.env[`DEFENDER_RELAY_SECRET_${network.id}`] || '',
  }
})

/*
  To obtain and set up your Google application credentials, follow these steps:
  1. Go to the Google Cloud Console: https://console.cloud.google.com
  2. Create or select a Google Cloud project.
  3. Enable the Google Wallet API.
  4. Navigate to IAM & Admin > Service Accounts.
  5. Click "Create Service Account", enter a name and description, then click       "Create" and "Continue".
  6. Go to the "Keys" tab, click "Add Key" > "Create New Key", choose "JSON", and click "Create" to download the key file.
  7. Open the downloaded JSON key file, and manually copy the `client_email` and `private_key` values and set them accordingly:
      GOOGLE_WALLET_SERVICES_EMAIL
      GOOGLE_WALLET_SERVICES_KEY
*/
const googleWalletApplicationCredentials: GoogleWalletCredentials = {
  client_email:
    process.env.GOOGLE_WALLET_SERVICES_EMAIL ||
    'dummy-client-email@appspot.gserviceaccount.com',
  private_key:
    process.env.GOOGLE_WALLET_SERVICES_KEY ||
    '-----BEGIN PRIVATE KEY-----\nA1B2C3D4E5...dummy-private-key...\n-----END PRIVATE KEY-----\n',
}

const config = {
  isProduction,
  database: {
    logging: false,
    dialect: 'postgres',
  } as Options,
  stripeSecret: process.env.STRIPE_SECRET || 'stripeSecret',
  defaultNetwork: 1,
  purchaserCredentials:
    process.env.PURCHASER_CREDENTIALS ||
    '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61',
  unlockApp: process.env.UNLOCK_APP || defaultConfig.unlockApp,
  logging: false,
  services: {
    wedlocks: process.env.WEDLOCKS || defaultConfig.services.wedlocks,
    locksmith: defaultConfig.services.locksmith,
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT,
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    bucket: process.env.STORAGE_BUCKET || 'images',
    publicHost:
      process.env.STORAGE_PUBLIC_HOST || defaultConfig.storage.publicHost,
    exportsBucket: 'uploads',
    merkleTreesBucket: 'merkle-trees',
  },
  recaptchaSecret: process.env.RECAPTCHA_SECRET,
  /* To utilize the Gitcoin Passport API, you need the GITCOIN_API_KEY and GITCOIN_SCORER_ID, essential for authentication and scoring customization.
  
  While setting these up in the Gitcoin passport dashboard, select the "Bot Prevention" use case for creating a scorer.
  
  This setup ensures secure, application-specific API access. For comprehensive setup instructions, see the Gitcoin Passport API documentation:
  https://docs.passport.gitcoin.co/building-with-passport/passport-api/getting-access
  */
  gitcoinApiKey: process.env.GITCOIN_API_KEY,
  gitcoinScorerId: process.env.GITCOIN_SCORER_ID,
  googleWalletApplicationCredentials,
  // Google Wallet Issuer ID
  /*
    1. Visit the Google Pay & Wallet Console: https://pay.google.com/business/console
    2. Sign in with your Google account and complete the registration process.
    3. Navigate to the "Google Wallet API" menu on the sidebar in the console. Your Issuer ID will be displayed at the top of this section.
  */
  googleWalletIssuerID: process.env.GOOGLE_WALLET_API_ISSUER_ID,
  // Google wallet class
  googleWalletClass: process.env.GOOGLE_WALLET_API_CLASS,
  // Base 64 encoded certificates to sign and validate Apple Wallet passes
  signerCertBase64: process.env.APPLE_WALLET_SIGNER_CERT,
  signerKeyBase64: process.env.APPLE_WALLET_SIGNER_KEY,
  wwdrBase64: process.env.APPLE_WALLET_WWDR_CERT,
  signerKeyPassphrase: process.env.APPLE_WALLET_SIGNER_KEY_PASSPHRASE,
  privyAppId: process.env.PRIVY_APP_ID,
  privyAppSecret: process.env.PRIVY_APP_SECRET,
  eventCasterApiKey: process.env.EVENTCASTER_API_KEY,

  logtailSourceToken: process.env.LOGTAIL,
  sessionDuration: Number(process.env.SESSION_DURATION || 86400 * 60), // 60 days
  requestTimeout: '25s',
  defenderRelayCredentials,
  databaseUrl: process.env.DATABASE_URL || '',
  sentry: {
    dsn: 'https://30c5b6884872435f8cbda4978c349af9@o555569.ingest.sentry.io/5685514',
  },
  // https://docs.cdp.coinbase.com/developer-platform/docs/cdp-keys/
  coinbaseCloudApiKeyName: process.env.COINBASE_CLOUD_API_KEY_NAME,
  // https://docs.cdp.coinbase.com/developer-platform/docs/cdp-keys/
  coinbaseCloudPrivateKey: process.env.COINBASE_CLOUD_PRIVATE_KEY,
  // https://console.cloud.google.com/apis/dashboard
  googleAuthClientId: process.env.GOOGLE_AUTH_CLIENT_ID,
}

if (process.env.ON_HEROKU) {
  // Heroku needs this:
  config.database.ssl = true
  config.database.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  }
}

// Database URL
if (process.env.DATABASE_URL) {
  const databaseConfigUrl = new URL(process.env.DATABASE_URL)
  config.database.username = databaseConfigUrl.username
  config.database.password = databaseConfigUrl.password
  config.database.host = databaseConfigUrl.hostname
  config.database.port = Number(databaseConfigUrl.port)
  config.database.database = databaseConfigUrl.pathname.substring(1)
} else {
  config.database.username = process.env.DB_USERNAME
  config.database.password = process.env.DB_PASSWORD
  config.database.database = process.env.DB_NAME
  config.database.host = process.env.DB_HOSTNAME
}

const connectionString = `postgresql://${config.database.username}:${config.database.password}@${config.database.host}/${config.database.database}`

config.databaseUrl = connectionString

export default config
