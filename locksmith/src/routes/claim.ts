import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router({ mergeParams: true })
const purchaseController = require('../controllers/purchaseController')

router.post(
  '/',
  signatureValidationMiddleware.generateProcessor({
    name: 'Claim Membership',
    required: ['publicKey', 'lock', 'publicKey'],
    signee: 'publicKey',
  })
)
router.post('/', purchaseController.claim)
module.exports = router
