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
      sentry: config.sentry,
      level: 'error',
      handleRejections: true,
      handleExceptions: true,
    })
  )

  if (config.logtailSourceToken) {
    const logtail = new Logtail(config.logtailSourceToken)
    // @ts-expect-error Argument of type 'import("/unlock/node_modules/@logtail/node/dist/es6/node").Node' is not assignable to parameter of type 'import("/unlock/node_modules/@logtail/winston/node_modules/@logtail/node/dist/es6/node").Node'.
    logger.add(new LogtailTransport(logtail))
  }
}

export default logger
