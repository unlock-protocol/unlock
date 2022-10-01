/* eslint no-console: 0 */

import winston from 'winston'
import config from './config'

/**
 * The logger. Logging to stdout
 */

// log function overwritten based on comments at https://github.com/winstonjs/winston/issues/1594#issuecomment-492420971
const LEVEL = Symbol.for('level')
const MESSAGE = Symbol.for('message')

const consoleTransport = new winston.transports.Console({
  silent: config.unlockEnv === 'test',
  log: function (info, callback) {
    setImmediate(() => this.emit('logged', info))

    if (this.stderrLevels[info[LEVEL]]) {
      console.error(info[MESSAGE])
      if (callback) callback()
      return
    }

    console.log(info[MESSAGE])
    if (callback) callback()
  },
})

export default winston.createLogger({
  format: winston.format.json(),
  transports: [consoleTransport],
  level: config.unlockEnv === 'dev' ? 'debug' : 'info',
})
