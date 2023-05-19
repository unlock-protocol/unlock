import express from 'express'
import { PurchaseController } from '../controllers/purchaseController'
import { createGeoRestriction } from '../utils/middlewares/geoRestriction'

const purchaseController = new PurchaseController()
const router = express.Router({ mergeParams: true })

// Disallow claim due to spam and bot activity
const geoRestriction = createGeoRestriction(['RU', 'UA'])

router.post(
  '/:network/locks/:lockAddress',
  geoRestriction,
  async (req, res) => await purchaseController.canClaim(req, res)
)

export default router
