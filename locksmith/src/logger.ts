import winston from 'winston'
import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import config from '../config/config'

const { combine, timestamp, json, simple } = winston.format

export const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [],
})

// No output in tests
logger.add(
  new winston.transports.Console({
    silent: !!(
      process.env?.NODE_ENV &&
      ['test', 'production'].indexOf(process.env?.NODE_ENV) > -1
    ),
    format: simple(),
  })
)

if (process.env.NODE_ENV === 'production') {
  if (config.logtailSourceToken) {
    const logtail = new Logtail(config.logtailSourceToken)
    logger.add(new LogtailTransport(logtail))
  }
}

export default logger
