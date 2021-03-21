import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import expressWinston from 'express-winston'
import winston from 'winston'
import { typeDefs } from './graphql/typeDefinitions'
import { resolvers } from './graphql/resolvers'

const app = express()

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
})
server.applyMiddleware({ app })

const router = require('./routes')

app.use(cors())
app.use(bodyParser.json())
app.use('/', router)

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
