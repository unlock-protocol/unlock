import bodyParser = require('body-parser')
import cors = require('cors')
import express = require('express')
import signatureValidationMiddleware = require('./signatureValidationMiddleware')

const app: express.Application = express()
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

export default app
