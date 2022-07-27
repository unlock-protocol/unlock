import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'
import { PurchaseController } from '../controllers/purchaseController'
import { SignedRequest } from '../types'

const purchaseController = new PurchaseController()
const router = express.Router({ mergeParams: true })

router.post(
  '/',
  signatureValidationMiddleware.generateProcessor({
    name: 'Claim Membership',
    required: ['publicKey', 'lock', 'publicKey'],
    signee: 'publicKey',
  })
)

router.get('/:network/locks/:lockAddress', (req, res) =>
  purchaseController.canClaim(req, res)
)
router.post('/', (req, res) =>
  purchaseController.claim(req as SignedRequest, res)
)

module.exports = router
