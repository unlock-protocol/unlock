import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router({ mergeParams: true })
const lockController = require('../controllers/lockController')

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

router.post('/lock', lockController.lockSave)
router.get('/lock/:lockAddress', lockController.lockGet)
router.get('/lock/:lockAddress/cycle', lockController.lockOwnershipCheck)
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

router.post('/lock/:lockAddress/migrate', lockController.lockMigrate)
router.get('/lock/:lockAddress/migrate', lockController.lockMigrateStatus)

router.get(
  '/lock/:lockAddress/stripe-connected',
  lockController.stripeConnected
)

router.get('/:owner/locks', lockController.lockOwnerGet)

module.exports = router
