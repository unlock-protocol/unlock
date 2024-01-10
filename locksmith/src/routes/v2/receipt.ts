import express from 'express'
import { ReceiptController } from '../../controllers/v2/receiptController'

import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerOrPayerMiddleware } from '../../utils/middlewares/lockManagerOrPayer'
import {
  allReceipts,
  createDownloadReceiptsRequest,
  downloadReceipts,
} from '../../controllers/v2/receipts'
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

router
  .use(authenticatedMiddleware, lockManagerMiddleware)
  .get('/all/:network/:lockAddress', createDownloadReceiptsRequest)
  .get('/all/:id', downloadReceipts)

export default router
