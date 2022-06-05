import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router({ mergeParams: true })
const purchaseController = require('../controllers/purchaseController')

router.get('/', purchaseController.info)

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

router.post('/prepare', purchaseController.createPaymentIntent)
router.post('/capture', purchaseController.capturePaymentIntent) // No signature needed

module.exports = router
