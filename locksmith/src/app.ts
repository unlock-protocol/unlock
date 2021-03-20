import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { typeDefs } from './graphql/typeDefinitions'
import { resolvers } from './graphql/resolvers'

const app = express()

const server = new ApolloServer({
  typeDefs,
  resolvers,
})
server.applyMiddleware({ app })

const transactionRouter = require('./routes/transaction')
const lockRouter = require('./routes/lock')
const userRouter = require('./routes/user')
const purchaseRouter = require('./routes/purchase')
const priceRouter = require('./routes/price')
const metadataRouter = require('./routes/metadata')
const healthCheckRouter = require('./routes/health')

app.use(cors())
app.use(bodyParser.json())
app.use('/', transactionRouter)
app.use('/', lockRouter)
app.use('/users', userRouter)
app.use('/purchase', purchaseRouter)
app.use('/price', priceRouter)
app.use('/api/key', metadataRouter)
app.use('/health', healthCheckRouter)
module.exports = app
