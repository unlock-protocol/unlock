import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'
import { authMiddleware } from '../utils/middlewares/auth'
import { lockManagerMiddleware } from '../utils/middlewares/lockManager'
import lockController from '../controllers/lockController'
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

router.get('/lock/:lockAddress/icon', lockController.lockIcon)

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
  '/:network/lock/:lockAddress/stripe/',
  authMiddleware,
  lockManagerMiddleware,
  lockController.disconnectStripe
)

router.get(
  '/lock/:lockAddress/stripe-connected',
  lockController.stripeConnected
)

module.exports = router
