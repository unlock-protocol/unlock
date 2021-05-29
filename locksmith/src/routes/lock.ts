import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router({ mergeParams: true })
const lockController = require('../controllers/lockController')

const connectStripeConfiguration = {
  name: 'Connect Stripe',
  required: ['lockAddress', 'chain', 'lockManager', 'baseUrl'],
  signee: 'lockManager',
}

router.post('/lock', lockController.lockSave)
router.get('/lock/:lockAddress', lockController.lockGet)
router.get('/lock/:lockAddress/cycle', lockController.lockOwnershipCheck)
router.get('/lock/:lockAddress/icon', lockController.lockIcon)

router.get(
  '/lock/:lockAddress/stripe',
  signatureValidationMiddleware.generateSignatureEvaluator(
    connectStripeConfiguration
  )
)
router.get('/lock/:lockAddress/stripe', lockController.connectStripe)

router.get('/:owner/locks', lockController.lockOwnerGet)

module.exports = router
