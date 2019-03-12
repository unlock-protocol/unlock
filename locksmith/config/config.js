require('dotenv').config()

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: 'development.sqlite3',
    operatorsAliases: false,
  },
  test: {
    username: 'locksmith_test',
    password: 'password',
    database: 'locksmith_test',
    host: 'localhost',
    logging: false,
    dialect: 'postgres',
    operatorsAliases: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'postgres',
    operatorsAliases: false,
  },
}
