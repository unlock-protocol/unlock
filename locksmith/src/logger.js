import Sentry from 'winston-sentry-log'

const winston = require('winston')

const { combine } = winston.format

const logger = winston.createLogger({
  level: 'info',
  format: combine(winston.format.timestamp(), winston.format.json()),
  transports: [],
})

// No output in tests
logger.add(
  new winston.transports.Console({
    silent: process.env?.NODE_ENV === 'test',
    format: winston.format.simple(),
  })
)

if (process.env?.NODE_ENV === 'production') {
  const options = {
    config: {
      dsn: 'https://30c5b6884872435f8cbda4978c349af9@o555569.ingest.sentry.io/5685514',
    },
    level: 'info',
  }
  logger.add(new Sentry(options))
}

module.exports = logger
