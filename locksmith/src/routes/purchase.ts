import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'
import { PurchaseController } from '../controllers/purchaseController'
import { SignedRequest } from '../types'

const purchaseController = new PurchaseController()
const router = express.Router({ mergeParams: true })

router.get('/', (req, res) =>
  purchaseController.info(req as SignedRequest, res)
)

router.post(
  '/',
  signatureValidationMiddleware.generateProcessor({
    name: 'Charge Card',
    required: ['publicKey', 'lock', 'publicKey'],
    signee: 'publicKey',
  })
)

/**
 * Prepares paymentIntent for confirmation on front-end (required for 3D secure)
 */
router.post(
  '/prepare',
  signatureValidationMiddleware.generateProcessor({
    name: 'Charge Card',
    required: ['publicKey', 'lock', 'publicKey'],
    signee: 'publicKey',
  })
)

router.post('/prepare', (req, res) =>
  purchaseController.createPaymentIntent(req as SignedRequest, res)
)
router.post('/capture', (req, res) =>
  purchaseController.capturePaymentIntent(req as SignedRequest, res)
) // No signature needed

module.exports = router
