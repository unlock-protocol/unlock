const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOSTNAME,
  dialect: 'postgres',
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

if (process.env.NODE_ENV === 'staging') {
  
  // delete local config
  delete config.username
  delete config.password
  delete config.database
  delete config.host

  // use db string provided by Heroku
  config.use_env_variable = "DATABASE_URL"
  config.dialectOptions = {
    ssl: true,
    rejectUnauthorized: false
  }
}

module.exports = config
