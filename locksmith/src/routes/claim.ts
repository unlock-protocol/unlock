import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'
import { PurchaseController } from '../controllers/purchaseController'
import { SignedRequest } from '../types'
import { captchaMiddleware } from '../utils/middlewares/recaptchaMiddleware'
import { createGeoRestriction } from '../utils/middlewares/geoRestriction'

const purchaseController = new PurchaseController()
const router = express.Router({ mergeParams: true })

// Disallow claim due to spam and bot activity
const geoRestriction = createGeoRestriction(['RU', 'UA'])

router.post(
  '/',
  geoRestriction,
  captchaMiddleware,
  signatureValidationMiddleware.generateProcessor({
    name: 'Claim Membership',
    required: ['publicKey', 'lock', 'publicKey'],
    signee: 'publicKey',
  })
)

router.get('/:network/locks/:lockAddress', geoRestriction, (req, res) =>
  purchaseController.canClaim(req, res)
)

router.post('/', geoRestriction, (req, res) =>
  purchaseController.claim(req as SignedRequest, res)
)

export default router
