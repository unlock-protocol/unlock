import express from 'express'
import { authMiddleware } from '../utils/middlewares/auth'

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
const metadataRouterV2 = require('./v2/metadata')
const applicationRouter = require('./v2/application')
const verifierRouter = require('./v2/verifier')
const grantKeysRouter = require('./v2/grantKeys')
const ticketRouter = require('./v2/ticket')
const qrcodeRouter = require('./v2/qrcode')

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
router.use('/v2', authMiddleware)
router.use('/v2/auth', authRouterV2)
router.use('/v2/applications', applicationRouter)
router.use('/v2/api/metadata', metadataRouterV2)
router.use('/v2/api/verifier', verifierRouter)
router.use('/v2/api/grant', grantKeysRouter)
router.use('/v2/api/ticket', ticketRouter)
router.use('/v2/api/qrcode', qrcodeRouter)

router.use('/', (_, res) => {
  res.send('<a href="https://unlock-protocol.com/">Unlock Protocol</a>')
})
module.exports = router
