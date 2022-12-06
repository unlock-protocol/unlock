import express from 'express'
import { PurchaseController } from '../../controllers/v2/purchaseController'
import {
  authenticatedMiddleware,
  userOnlyMiddleware,
} from '../../utils/middlewares/auth'

const purchaseController = new PurchaseController()
const router = express.Router({ mergeParams: true })

router.post('/setup', authenticatedMiddleware, userOnlyMiddleware, (req, res) =>
  purchaseController.createSetupIntent(req, res)
)

router.get('/list', authenticatedMiddleware, userOnlyMiddleware, (req, res) =>
  purchaseController.list(req, res)
)

router.post('/intent/:network/locks/:lockAddress', (req, res) => {
  purchaseController.createPaymentIntent(req, res)
})

module.exports = router
