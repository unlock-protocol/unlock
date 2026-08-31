// ABOUTME: Application logger. Railway's log view (stdout) is the only log
// ABOUTME: sink, so the console transport stays on everywhere except in tests.
import winston from 'winston'

const { combine, timestamp, json, simple } = winston.format

export const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [],
})

// No output in tests
logger.add(
  new winston.transports.Console({
    silent: process.env?.NODE_ENV === 'test',
    format: simple(),
  })
)

export default logger
