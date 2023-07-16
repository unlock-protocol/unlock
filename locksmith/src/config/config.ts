import '../utils/envLoader'
import { Options } from 'sequelize'

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

const defenderRelayCredentials: DefenderRelayCredentials = {
  80001: {
    apiKey: process.env.DEFENDER_RELAY_KEY_80001 || '',
    apiSecret: process.env.DEFENDER_RELAY_SECRET_80001 || '',
  },
  137: {
    apiKey: process.env.DEFENDER_RELAY_KEY_137 || '',
    apiSecret: process.env.DEFENDER_RELAY_SECRET_137 || '',
  },
  5: {
    apiKey: process.env.DEFENDER_RELAY_KEY_5 || '',
    apiSecret: process.env.DEFENDER_RELAY_SECRET_5 || '',
  },
}

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
  },
  recaptchaSecret: process.env.RECAPTCHA_SECRET,
  logtailSourceToken: process.env.LOGTAIL,
  sessionDuration: Number(process.env.SESSION_DURATION || 86400 * 60), // 60 days
  requestTimeout: '30s',
  defenderRelayCredentials,
  databaseUrl: process.env.DATABASE_URL || '',
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
