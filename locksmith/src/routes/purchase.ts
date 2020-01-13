import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router()
const purchaseController = require('../controllers/purchaseController')

router.use(
  signatureValidationMiddleware.generateProcessor({
    name: 'purchaseRequest',
    required: ['recipient', 'lock', 'expiry'],
    signee: 'recipient',
  })
)
router.post('/', purchaseController.purchase)

module.exports = router
