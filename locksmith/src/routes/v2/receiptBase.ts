import express from 'express'

import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'
import { ReceiptBaseController } from '../../controllers/v2/receiptBaseController'

const router = express.Router({ mergeParams: true })

const receiptController = new ReceiptBaseController()

router.get(
  '/:network/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => receiptController.getSupplier(req, res)
)

router.post(
  '/:network/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => receiptController.saveSupplier(req, res)
)

export default router
