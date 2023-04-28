require('./envLoader')

const config = {
  database: {
    logging: false,
    dialect: 'postgres',
  },
  stripeSecret: process.env.STRIPE_SECRET,
  defaultNetwork: 1,
  purchaserCredentials:
    process.env.PURCHASER_CREDENTIALS ||
    '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61',
  unlockApp: process.env.UNLOCK_APP || 'https://app.unlock-protocol.com',
  logging: false,
  services: {
    wedlocks: process.env.WEDLOCKS || 'http://localhost:1337',
  },
  recaptchaSecret: process.env.RECAPTCHA_SECRET,
  logtailSourceToken: process.env.LOGTAIL,
  requestTimeout: '25s',
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
  config.database.port = databaseConfigUrl.port
  config.database.database = databaseConfigUrl.pathname.substring(1)
} else {
  config.database.username = process.env.DB_USERNAME
  config.database.password = process.env.DB_PASSWORD
  config.database.database = process.env.DB_NAME
  config.database.host = process.env.DB_HOSTNAME
  config.database.options = {
    dialect: 'postgres',
  }
}

if (process.env.UNLOCK_ENV === 'prod') {
  config.services.wedlocks =
    'https://wedlocks.unlock-protocol.com/.netlify/functions/handler'
} else if (process.env.UNLOCK_ENV === 'staging') {
  config.services.wedlocks =
    'https://staging-wedlocks.unlock-protocol.com/.netlify/functions/handler'
}

module.exports = config
