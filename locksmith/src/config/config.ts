import fs from 'fs'
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
    apiKey: string
    apiSecret: string
  }
}

// Interface for Google API credentials
interface Credentials {
  client_email: string
  private_key: string
}

const defenderRelayCredentials: DefenderRelayCredentials = {}
Object.values(networks).forEach((network) => {
  defenderRelayCredentials[network.id] = {
    apiKey: process.env[`DEFENDER_RELAY_KEY_${network.id}`] || '',
    apiSecret: process.env[`DEFENDER_RELAY_SECRET_${network.id}`] || '',
  }
})

/* Load and parse the Google application credentials from the environment variable GOOGLE_APPLICATION_CREDENTIALS.

// To obtain the GOOGLE_APPLICATION_CREDENTIALS, follow these steps:
// 1. Go to the Google Cloud Console: https://console.cloud.google.com/
// 2. Create or select a Google Cloud project.
// 3. Enable the Google Wallet API.
// 4. Navigate to IAM & Admin > Service Accounts.
// 5. Click "Create Service Account", enter a name and description, then click "Create" and "Continue".
// 7. Go to the "Keys" tab, click "Add Key" > "Create New Key", choose "JSON", and click "Create" to download the key file.
// 8. Set the environment variable to point to the key file:
//    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
// For more details, visit: https://cloud.google.com/docs/authentication/application-default-credentials
*/

const googleApplicationCredentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS

if (!googleApplicationCredentialsPath) {
  throw new Error(
    'The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.'
  )
}

const googleApplicationCredentials: Credentials = JSON.parse(
  fs.readFileSync(googleApplicationCredentialsPath as string, 'utf-8')
)

const config = {
  isProduction,
  database: {
    logging: false,
    dialect: 'postgres',
  } as Options,
  stripeSecret: process.env.STRIPE_SECRET,
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
  },
  recaptchaSecret: process.env.RECAPTCHA_SECRET,
  /* To utilize the Gitcoin Passport API, you need the GITCOIN_API_KEY and GITCOIN_SCORER_ID, essential for authentication and scoring customization.
  
  While setting these up in the Gitcoin passport dashboard, select the "Bot Prevention" use case for creating a scorer.
  
  This setup ensures secure, application-specific API access. For comprehensive setup instructions, see the Gitcoin Passport API documentation:
  https://docs.passport.gitcoin.co/building-with-passport/passport-api/getting-access
  */
  gitcoinApiKey: process.env.GITCOIN_API_KEY,
  gitcoinScorerId: process.env.GITCOIN_SCORER_ID,
  googleApplicationCredentials,
  // Google wallet Issuer ID
  /* 1. Visit the Google Pay & Wallet Console: https://pay.google.com/gp/w/home/settings
  2. Sign in with your Google account and complete the registration process.
  3. Your Issuer ID will be displayed under "Issuer Info" in the console settings.
  For more details, visit: https://codelabs.developers.google.com/add-to-wallet-web#3
  */
  googleWalletIssuerID: process.env.GOOGLE_WALLET_API_ISSUER_ID,
  // Google wallet class
  googleWalletClass: process.env.GOOGLE_WALLET_API_CLASS,
  logtailSourceToken: process.env.LOGTAIL,
  sessionDuration: Number(process.env.SESSION_DURATION || 86400 * 60), // 60 days
  requestTimeout: '25s',
  defenderRelayCredentials,
  databaseUrl: process.env.DATABASE_URL || '',
  sentry: {
    dsn: 'https://30c5b6884872435f8cbda4978c349af9@o555569.ingest.sentry.io/5685514',
  },
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
