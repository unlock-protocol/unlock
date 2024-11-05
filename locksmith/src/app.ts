import cors from 'cors'
import express from 'express'
import expressWinston from 'express-winston' // TODO: use a single logger!
import winston from 'winston'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import cookieParser from 'cookie-parser'
import router from './routes'
import { errorHandler } from './utils/middlewares/error'
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

Sentry.init({
  ...config.sentry,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,
})
// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(
  Sentry.Handlers.requestHandler({
    ip: true,
  })
)
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

// Parse cookies
app.use(cookieParser())

// Cors
app.use(cors())

// Parse body
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: '5mb' }))

// Request logging not when testing
if ('test' !== process.env?.NODE_ENV) {
  app.use(
    expressWinston.logger({
      transports: logger.transports,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      ),
      meta: true, // optional: control whether you want to log the meta data about the request (default to true)
      msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    })
  )
}

app.use('/', router)

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler())

// Error logging
if ('test' !== process.env?.NODE_ENV) {
  app.use(
    expressWinston.errorLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      ),
    })
  )
}

app.use(errorHandler)

export default app
