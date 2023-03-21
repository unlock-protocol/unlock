import Sentry from 'winston-transport-sentry-node'
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
  logger.add(
    new Sentry({
      sentry: {
        dsn: 'https://30c5b6884872435f8cbda4978c349af9@o555569.ingest.sentry.io/5685514',
      },
      level: 'error',
      handleRejections: true,
      handleExceptions: true,
    })
  )

  if (config.logtailSourceToken) {
    const logtail = new Logtail(config.logtailSourceToken)
    logger.add(new LogtailTransport(logtail))
  }
}

export default logger
