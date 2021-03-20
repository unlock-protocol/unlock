const winston = require('winston')

const { combine } = winston.format

const logger = winston.createLogger({
  level: 'info',
  format: combine(winston.format.timestamp(), winston.format.json()),
  transports: [],
})

// No output in tests
if (process.env?.NODE_ENV !== 'test') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}

module.exports = logger
