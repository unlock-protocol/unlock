import 'setimmediate' // polyfill to prevent jest from crashing
import cors from 'cors'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import expressWinston from 'express-winston' // TODO: use a single logger!
import winston from 'winston'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import cookieParser from 'cookie-parser'
import { typeDefs } from './graphql/typeDefinitions'
import { resolvers } from './graphql/resolvers'

const app = express()

Sentry.init({
  dsn: 'https://30c5b6884872435f8cbda4978c349af9@o555569.ingest.sentry.io/5685514',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})
// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

// Parse cookies
app.use(cookieParser())

// Request logging
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console({
        silent: process.env?.NODE_ENV === 'test',
      }),
    ],
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

// Cors
app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

// Parse body
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: '5mb' }))

const server = new ApolloServer({
  typeDefs,
  resolvers,
})
server.applyMiddleware({ app })

const router = require('./routes')

app.use('/', router)

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler())

// Error logging
app.use(
  expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        silent: process.env?.NODE_ENV === 'test',
      }),
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
  })
)
module.exports = app
