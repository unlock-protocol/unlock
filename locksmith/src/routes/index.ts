import express from 'express'
import { authMiddleware } from '../utils/middlewares/auth'

import lockRouter from './lock'
import userRouter from './user'
import purchaseRouter from './purchase'
import claimRouter from './claim'
import metadataRouter from './metadata'
import authRouter from './auth'
import captchaRouter from './captcha'
import healthCheckRouter from './health'
import hookRouter from './hook'
import authRouterV2 from './v2/auth'
import metadataRouterV2 from './v2/metadata'
import applicationRouter from './v2/application'
import verifierRouter from './v2/verifier'
import grantKeysRouter from './v2/grantKeys'
import ticketRouter from './v2/ticket'
import keyRouterV2 from './v2/key'
import purchaseRouterV2 from './v2/purchase'
import priceRouterV2 from './v2/price'
import contractsRouter from './v2/contracts'
import subscriptionRouter from './v2/subscriptions'
import claimV2Router from './v2/claim'
import imagesRouter from './v2/images'
import transferRouter from './v2/transfer'
import receiptRouter from './v2/receipt'
import receiptBaseRouter from './v2/receiptBase'
import emailRouter from './v2/email'
import checkoutConfigRouter from './v2/checkoutConfigs'
import config from '../config/config'
import stripeRouter from './v2/stripe'
import lockSettingsRouter from './v2/lock-settings'
import certificateRouter from './v2/certificate'
import ogRouter from './v2/og'
import eventsRouter from './v2/events'
import hooksRooter from './v2/hooks'
import emailSubscriptionRouter from './v2/emailSubscriptions'
import { createCacheMiddleware } from '../utils/middlewares/cacheMiddleware'
import magicEdenRouter from './v2/magicEden'
import rsvpRouter from './v2/rsvp'
import passRouter from './v2/pass'
import newUserRouter from './v2/user'
import eventCollectionRouter from './v2/eventCollection'
import eventCasterRouter from './v2/eventCaster'
import privyRouter from './v2/privy'
import merkleTreeRouter from './v2/merkleTree'

const router: express.Router = express.Router({ mergeParams: true })

// Set the chain!
router.use((request, _, next) => {
  const match = request.path.match(/^\/([0-9]*)\/.*/)
  let chain = config.defaultNetwork || 1
  if (match) {
    // When the route starts with the chain (deprecated?)
    chain = parseInt(match[1])
  } else if (request.query?.chain) {
    chain = parseInt(String(request.query.chain))
  }
  request.chain = chain
  next()
})
router.use('/', lockRouter)
router.use('/users', userRouter)
router.use('/purchase', purchaseRouter)
router.use('/claim', claimRouter)

// Redirects for broken base URLs
router.use(
  '/api/key/:chain([0-9]{1,12}):lock(0x[0-9A-Fa-f]{40}):rest(/[0-9]{0,12})?',
  (req, res) => {
    res.redirect(
      `/api/key/${req.params.chain}/${req.params.lock}${req.params.rest || ''}`
    )
    return
  }
)

router.use(
  '/api/key/:chain([0-9]{1,12})/',
  createCacheMiddleware(),
  metadataRouter
)
router.use('/api/key', metadataRouter)
router.use('/health', healthCheckRouter)
router.use('/api/oauth', authRouter)
router.use('/api/captcha', captchaRouter)
router.use('/api/hooks', hookRouter)
router.use('/v2', authMiddleware)
router.use('/v2/auth', authRouterV2)
router.use('/v2/images', imagesRouter)
router.use('/v2/api/metadata', metadataRouterV2)
router.use('/v2/api/verifier', verifierRouter)
router.use('/v2/api/grant', grantKeysRouter)
router.use('/v2/api/ticket', ticketRouter)
router.use('/v2/api/contracts', contractsRouter)
router.use('/v2/api', keyRouterV2)
router.use('/v2/api', priceRouterV2)
router.use('/v2/applications', applicationRouter)
router.use('/v2/purchase', purchaseRouterV2)
router.use('/v2/subscriptions', subscriptionRouter)
router.use('/v2/claim', claimV2Router)
router.use('/v2/transfer', transferRouter)
router.use('/v2/receipts', receiptRouter)
router.use('/v2/receipts-base', receiptBaseRouter)
router.use('/v2/email', emailRouter)
router.use('/v2/checkout', checkoutConfigRouter)
router.use('/v2/stripe', stripeRouter)
router.use('/v2/lock-settings', lockSettingsRouter)
router.use('/v2/certificate', certificateRouter)
router.use('/v2/og', ogRouter) // deprecated!
router.use('/v2/events', eventsRouter)
router.use('/v2/hooks', hooksRooter)
router.use('/v2/email-subscriptions', emailSubscriptionRouter)
router.use('/v2/magic-eden', magicEdenRouter)
router.use('/v2/rsvp', rsvpRouter)
router.use('/v2/pass', passRouter)
router.use('/v2/api/users', newUserRouter)
router.use('/v2/event-collection', eventCollectionRouter)
router.use('/v2/eventcaster', eventCasterRouter)
router.use('/v2/privy', privyRouter)
router.use('/v2/merkle-tree', merkleTreeRouter)
router.use('/', (_, res) => {
  res.send('<a href="https://unlock-protocol.com/">Unlock Protocol</a>')
})

export default router
