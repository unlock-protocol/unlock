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
router.post('/', purchaseController.purchase)
module.exports = router
