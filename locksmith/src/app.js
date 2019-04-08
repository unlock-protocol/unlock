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
var purchaseRouter = require('./routes/purchase')

let lockSignatureConfiguration = {
  name: 'lock',
  required: ['name', 'owner', 'address'],
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
app.use('/users', userRouter)
app.use('/purchase', purchaseRouter)

module.exports = app
