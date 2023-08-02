import express from 'express'
import { PurchaseController } from '../controllers/purchaseController'
import { createGeoRestriction } from '../utils/middlewares/geoRestriction'
import { captchaMiddleware } from '../utils/middlewares/recaptchaMiddleware'

const purchaseController = new PurchaseController()
const router = express.Router({ mergeParams: true })

// Disallow claim due to spam and bot activity
const geoRestriction = createGeoRestriction(['RU', 'UA'])

router.post(
  '/:network/locks/:lockAddress',
  geoRestriction,
  captchaMiddleware,
  async (req, res) => await purchaseController.canClaim(req, res)
)

export default router
