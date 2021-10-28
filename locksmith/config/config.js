const config = {
  database: {
    dialect: 'postgres',
  },
  stripeSecret: process.env.STRIPE_SECRET,
  web3ProviderHost: process.env.WEB3_PROVIDER_HOST,
  unlockContractAddress: process.env.UNLOCK_CONTRACT_ADDRESS,
  defaultNetwork: process.env.DEFAULT_NETWORK,
  purchaserCredentials:
    process.env.PURCHASER_CREDENTIALS ||
    '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61',
  graphQLBaseURL: process.env.GRAPHQL_BASE_URL,
  metadataHost: process.env.METADATA_HOST,
  logging: false,
  jaeger: {
    serviceName: 'locksmith',
    tags: [],
    port: 6832,
    maxPacketSize: 65000,
  },
}
// Heroku sets DATABASE_URL
if (process.env.DATABASE_URL) {
  config.database.uri = process.env.DATABASE_URL
  config.database.options = {
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
} else {
  config.database.username = process.env.DB_USERNAME
  config.database.password = process.env.DB_PASSWORD
  config.database.database = process.env.DB_NAME
  config.database.host = process.env.DB_HOSTNAME
}

module.exports = config
