import express from 'express'
import { ReceiptController } from '../../controllers/v2/receiptController'

import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerOrPayerMiddleware } from '../../utils/middlewares/lockManagerOrPayer'
import { allReceipts } from '../../controllers/v2/receipts'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router = express.Router({ mergeParams: true })

const receiptController = new ReceiptController()

router.get(
  '/:network/:lockAddress/all',
  authenticatedMiddleware,
  lockManagerMiddleware,
  allReceipts
)

router.get(
  '/:network/:lockAddress/:hash',
  authenticatedMiddleware,
  lockManagerOrPayerMiddleware,
  (req, res) => receiptController.getReceipt(req, res)
)

router.post(
  '/:network/:lockAddress/:hash',
  authenticatedMiddleware,
  lockManagerOrPayerMiddleware,
  (req, res) => receiptController.savePurchaser(req, res)
)

export default router
