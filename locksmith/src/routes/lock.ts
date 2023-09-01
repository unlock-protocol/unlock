import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'
import {
  authMiddleware,
  authenticatedMiddleware,
} from '../utils/middlewares/auth'
import { lockManagerMiddleware } from '../utils/middlewares/lockManager'
import lockController from '../controllers/lockController'
import { createCacheMiddleware } from '../utils/middlewares/cacheMiddleware'

const router = express.Router({ mergeParams: true })

const connectStripeConfiguration = {
  name: 'Connect Stripe',
  required: ['lockAddress', 'chain', 'lockManager', 'baseUrl'],
  signee: 'lockManager',
}

const changeLockIconConfiguration = {
  name: 'Update Icon',
  required: ['lockAddress', 'chain', 'lockManager'],
  signee: 'lockManager',
}

router.get(
  '/lock/:lockAddress/icon',
  createCacheMiddleware(),
  lockController.lockIcon
)

router.get(
  '/image/:network/:lockAddress/:keyId?',
  lockController.getTokenURIImage
)

router.post(
  '/lock/:lockAddress/icon',
  signatureValidationMiddleware.generateProcessor(changeLockIconConfiguration)
)
router.post('/lock/:lockAddress/icon', lockController.changeLockIcon)

router.get(
  '/lock/:lockAddress/stripe',
  signatureValidationMiddleware.generateSignatureEvaluator(
    connectStripeConfiguration
  )
)
router.get('/lock/:lockAddress/stripe', lockController.connectStripe)

router.delete(
  '/:network/lock/:lockAddress/stripe',
  authMiddleware,
  authenticatedMiddleware,
  lockManagerMiddleware,
  lockController.disconnectStripe
)

router.get(
  '/lock/:lockAddress/stripe-connected',
  lockController.stripeConnected
)

export default router
