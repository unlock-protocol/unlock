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

module.exports = logger
