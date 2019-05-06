import winston from 'winston'

/**
 * The logger. Logging to stdout
 */

const consoleTransport = new winston.transports.Console({
  silent: process.env.NODE_ENV === 'test',
})

export default winston.createLogger({
  transports: [consoleTransport],
})
