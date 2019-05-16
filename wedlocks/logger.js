import winston from 'winston'
import config from './config'

/**
 * The logger. Logging to stdout
 */

const consoleTransport = new winston.transports.Console({
  silent: config.unlockEnv === 'test',
})

export default winston.createLogger({
  transports: [consoleTransport],
  level: config.unlockEnv === 'dev' ? 'debug' : 'info',
})
