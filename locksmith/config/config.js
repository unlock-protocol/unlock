const path = require('path')
const dotenv = require('dotenv')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: 'development.sqlite3',
    operatorsAliases: false,
    stripeSecret: process.env.STRIPE_SECRET,
    web3ProviderHost: process.env.WEB3_PROVIDER_HOST,
    unlockContractAddress: process.env.UNLOCK_CONTRACT_ADDRESS,
    purchaserAddress: process.env.PURCHASER_ADDRESS,
    purchaserCredentails: process.env.PURCHASER_CREDENTIALS,
    jaeger: {
      serviceName: 'locksmith',
      tags: [],
      port: 6832,
      maxPacketSize: 65000,
    },
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    logging: false,
    dialect: 'postgres',
    operatorsAliases: false,
    stripeSecret: process.env.STRIPE_SECRET,
    web3ProviderHost: process.env.WEB3_PROVIDER_HOST,
    unlockContractAddress: process.env.UNLOCK_CONTRACT_ADDRESS,
    purchaserAddress: process.env.PURCHASER_ADDRESS,
    purchaserCredentails: process.env.PURCHASER_CREDENTIALS,
    jaeger: {
      serviceName: 'locksmith',
      tags: [],
      port: 6832,
      maxPacketSize: 65000,
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'postgres',
    operatorsAliases: false,
    stripeSecret: process.env.STRIPE_SECRET,
    web3ProviderHost: process.env.WEB3_PROVIDER_HOST,
    unlockContractAddress: process.env.UNLOCK_CONTRACT_ADDRESS,
    purchaserAddress: process.env.PURCHASER_ADDRESS,
    purchaserCredentails: process.env.PURCHASER_CREDENTIALS,
    jaeger: {
      serviceName: 'locksmith',
      tags: [],
      port: 6832,
      maxPacketSize: 65000,
    },
  },
}
