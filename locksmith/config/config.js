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
    logging: false,
    dialect: 'postgres',
    operatorsAliases: false,
    stripeSecret: process.env.STRIPE_SECRET,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    stripeSecret: process.env.STRIPE_SECRET,
    dialect: 'postgres',
    operatorsAliases: false,
  },
}
