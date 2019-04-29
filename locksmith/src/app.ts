import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'

const app = express()

let transactionRouter = require('./routes/transaction')
let lockRouter = require('./routes/lock')
let blockRouter = require('./routes/block')
let userRouter = require('./routes/user')
let eventRouter = require('./routes/event')
let purchaseRouter = require('./routes/purchase')
let priceRouter = require('./routes/price')
let metadataRouter = require('./routes/metadata')

app.use(cors())
app.use(bodyParser.json())
app.use('/', transactionRouter)
app.use('/', lockRouter)
app.use('/block', blockRouter)
app.use('/events', eventRouter)
app.use('/users', userRouter)
app.use('/purchase', purchaseRouter)
app.use('/price', priceRouter)
app.use('/api/key', metadataRouter)

module.exports = app
