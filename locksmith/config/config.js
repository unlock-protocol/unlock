require('dotenv').config()

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: 'development.sqlite3',
    operatorsAliases: false,
    stripeSecret: process.env.STRIPE_SECRET,
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT || 5432,
    logging: false,
    dialect: 'postgres',
    operatorsAliases: false,
    stripeSecret: process.env.STRIPE_SECRET,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    host: process.env.DB_HOSTNAME,
    stripeSecret: process.env.STRIPE_SECRET,
    dialect: 'postgres',
    operatorsAliases: false,
  },
}
