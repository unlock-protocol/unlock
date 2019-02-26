const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const signatureValidationMiddleware = require('./signatureValidationMiddleware')

const app = express()
const router = express.Router()

var transactionRouter = require('./routes/transaction')
var lockRouter = require('./routes/lock')
var blockRouter = require('./routes/block')

app.use(cors())
app.use(bodyParser.json())
app.put(/^\/lock\/\S+/i, signatureValidationMiddleware)
app.post(/^\/lock$/i, signatureValidationMiddleware)
app.use('/', router)
app.use('/', transactionRouter)
app.use('/', lockRouter)
app.use('/block', blockRouter)

module.exports = app
