import express from 'express'

const transactionRouter = require('./transaction')
const lockRouter = require('./lock')
const userRouter = require('./user')
const purchaseRouter = require('./purchase')
const priceRouter = require('./price')
const metadataRouter = require('./metadata')
const healthCheckRouter = require('./health')
const config = require('../../config/config')

const router = express.Router()

// Set the chain!
router.use((request, _, next) => {
  const match = request.path.match(/^\/([0-9]*)\/.*/)
  let chain = parseInt(config.defaultNetwork || 1337)

  if (match) {
    // When the route starts with the chain (deprecated?)
    chain = parseInt(match[1])
  } else if (request.params.chain) {
    // When the chain is explicit in the URL
    chain = parseInt(request.params.chain)
  } else if (request.query?.chain) {
    // @ts-expect-error
    chain = parseInt(request.query.chain)
  }
  // @ts-expect-error
  request.chain = chain
  next()
})
router.use('/', transactionRouter)
router.use('/', lockRouter)
router.use('/users', userRouter)
router.use('/purchase', purchaseRouter)
router.use('/price', priceRouter)
router.use('/api/key', metadataRouter)
router.use('/api/key/:chain', metadataRouter)
router.use('/health', healthCheckRouter)

router.use('/', (_, res) => {
  res.send('<a href="https://unlock-protocol.com/">Unlock Protocol</a>')
})
module.exports = router
