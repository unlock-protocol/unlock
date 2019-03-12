import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
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
