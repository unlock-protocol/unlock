import './instrument'
import cors from 'cors'
import express from 'express'
import expressWinston from 'express-winston' // TODO: use a single logger!
import winston from 'winston'
import * as Sentry from '@sentry/node'
import cookieParser from 'cookie-parser'
import router from './routes'
import { errorHandler } from './utils/middlewares/error'
import { requestLoggerOptions, errorLoggerOptions } from './utils/requestLogger'
import timeout from 'connect-timeout'
import config from './config/config'
import logger from './logger'

const app: express.Application = express()

if (config.requestTimeout) {
  app.use(timeout(config.requestTimeout))
}

// Enable proxy support
app.enable('trust proxy')

// Enable extended query parser
app.set('query parser', 'extended')

// Parse cookies
app.use(cookieParser())

// Cors
app.use(cors())

// Parse body
app.use(express.urlencoded({ limit: '5mb', extended: true }))
app.use(express.json({ limit: '5mb' }))

// Request logging not when testing
if ('test' !== process.env?.NODE_ENV) {
  app.use(
    expressWinston.logger({
      ...requestLoggerOptions,
      transports: logger.transports,
    })
  )
}

app.use('/', router)

// Add sentry error handler
Sentry.setupExpressErrorHandler(app)

// Error logging
if ('test' !== process.env?.NODE_ENV) {
  app.use(
    expressWinston.errorLogger({
      ...errorLoggerOptions,
      transports: [new winston.transports.Console()],
    })
  )
}

app.use(errorHandler)

export default app
