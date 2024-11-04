import express from 'express'
import { PurchaseController } from '../controllers/purchaseController'
import { SignedRequest } from '../types'

const purchaseController = new PurchaseController()
const router: express.Router = express.Router({ mergeParams: true })

router.get('/', (req, res) =>
  purchaseController.info(req as SignedRequest, res)
)

router.post('/capture', (req, res) =>
  purchaseController.capturePaymentIntent(req as SignedRequest, res)
) // No signature needed

export default router
