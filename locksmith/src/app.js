import signatureValidationMiddleware from './middlewares/signatureValidationMiddleware'

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')

const app = express()
const router = express.Router()

var transactionRouter = require('./routes/transaction')
var lockRouter = require('./routes/lock')
var blockRouter = require('./routes/block')
var userRouter = require('./routes/user')
var eventRouter = require('./routes/event')
var purchaseRouter = require('./routes/purchase')
var priceRouter = require('./routes/price')
var metadataRouter = require('./routes/metadata')

let lockSignatureConfiguration = {
  name: 'lock',
  required: ['name', 'owner', 'address'],
  signee: 'owner',
}

let eventConfiguration = {
  name: 'event',
  required: ['lockAddress', 'name', 'location', 'date', 'owner'],
  signee: 'owner',
}

app.use(cors())
app.use(bodyParser.json())
app.put(
  /^\/lock\/\S+/i,
  signatureValidationMiddleware.generateProcessor(lockSignatureConfiguration)
)
app.post(
  /^\/lock$/i,
  signatureValidationMiddleware.generateProcessor(lockSignatureConfiguration)
)

app.post(
  /^\/events$/i,
  signatureValidationMiddleware.generateProcessor(eventConfiguration)
)

app.post(
  /^\/users$/i,
  signatureValidationMiddleware.generateProcessor({
    name: 'user',
    required: ['emailAddress', 'publicKey', 'passwordEncryptedPrivateKey'],
    signee: 'publicKey',
  })
)
app.put(
  /^\/users$/i,
  signatureValidationMiddleware.generateProcessor({
    name: 'user',
    required: ['emailAddress', 'publicKey'],
    signee: 'publicKey',
  })
)

app.post(
  /^\/purchase$/i,
  signatureValidationMiddleware.generateProcessor({
    name: 'purchaseRequest',
    required: ['recipient', 'lock', 'expiry'],
    signee: 'recipient',
  })
)

app.use('/', router)
app.use('/', transactionRouter)
app.use('/', lockRouter)
app.use('/block', blockRouter)
app.use('/events', eventRouter)
app.use('/users', userRouter)
app.use('/purchase', purchaseRouter)
app.use('/price', priceRouter)
app.use('/api/key', metadataRouter)

module.exports = app
