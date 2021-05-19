import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router()
const purchaseController = require('../controllers/purchaseController')

router.post(
  '/',
  signatureValidationMiddleware.generateProcessor({
    name: 'purchaseRequest',
    required: ['recipient', 'lock', 'expiry'],
    signee: 'recipient',
  })
)

router.post(
  '/USD',
  signatureValidationMiddleware.generateProcessor({
    name: 'purchaseRequest',
    required: ['recipient', 'lock', 'expiry', 'USDAmount'],
    signee: 'recipient',
  })
)
router.post('/USD', purchaseController.purchaseUSD)

module.exports = router
