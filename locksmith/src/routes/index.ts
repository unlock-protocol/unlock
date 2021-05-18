import express from 'express'

const transactionRouter = require('./transaction')
const lockRouter = require('./lock')
const userRouter = require('./user')
const purchaseRouter = require('./purchase')
const priceRouter = require('./price')
const metadataRouter = require('./metadata')
const healthCheckRouter = require('./health')
const prefixedRouter = require('./prefixedRouter')
const config = require('../../config/config')

const router = express.Router()

// Set the chain!
router.use((request, _, next) => {
  const match = request.path.match(/^\/([1-9]*)\/.*/)
  // @ts-expect-error
  request.chain = match
    ? parseInt(match[1])
    : parseInt(config.defaultNetwork || 1984)
  next()
})
router.use('/', prefixedRouter(transactionRouter))
router.use('/', lockRouter)
router.use('/users', userRouter)
router.use('/purchase', purchaseRouter)
router.use('/price', priceRouter)
router.use('/api/key', metadataRouter)
router.use('/health', healthCheckRouter)

router.use('/', (_, res) => {
  res.send('<a href="https://unlock-protocol.com/">Unlock Protocol</a>')
})

module.exports = router
