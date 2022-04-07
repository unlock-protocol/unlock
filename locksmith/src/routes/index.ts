import express from 'express'
import { jwtMiddleware } from '../utils/jwt'

const transactionRouter = require('./transaction')
const lockRouter = require('./lock')
const userRouter = require('./user')
const purchaseRouter = require('./purchase')
const claimRouter = require('./claim')
const priceRouter = require('./price')
const metadataRouter = require('./metadata')
const authRouter = require('./auth')
const captchaRouter = require('./captcha')
const healthCheckRouter = require('./health')
const hookRouter = require('./hook')
const authRouterV2 = require('./v2/auth')
const config = require('../../config/config')

const router = express.Router({ mergeParams: true })

// Set the chain!
router.use((request, _, next) => {
  const match = request.path.match(/^\/([0-9]*)\/.*/)
  let chain = parseInt(config.defaultNetwork || 31337)
  if (match) {
    // When the route starts with the chain (deprecated?)
    chain = parseInt(match[1])
  } else if (request.query?.chain) {
    chain = parseInt(String(request.query.chain))
  }
  // @ts-expect-error
  request.chain = chain
  next()
})

router.use('/', transactionRouter)
router.use('/', lockRouter)
router.use('/users', userRouter)
router.use('/purchase', purchaseRouter)
router.use('/claim', claimRouter)
router.use('/price', priceRouter)
router.use('/api/key/:chain([0-9]{1,6})/', metadataRouter)
router.use('/api/key', metadataRouter)
router.use('/health', healthCheckRouter)
router.use('/api/oauth', authRouter)
router.use('/api/captcha', captchaRouter)
router.use('/api/hooks', hookRouter)
router.use('/v2', jwtMiddleware)
router.use('/v2/auth', authRouterV2)

router.use('/', (_, res) => {
  res.send('<a href="https://unlock-protocol.com/">Unlock Protocol</a>')
})
module.exports = router
