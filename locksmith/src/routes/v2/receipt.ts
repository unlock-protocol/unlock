import express from 'express'
import { ReceiptController } from '../../controllers/v2/receiptController'

import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerOrPayerMiddleware } from '../../utils/middlewares/lockManagerOrPayer'
import {
  allReceipts,
  createDownloadReceiptsRequest,
  downloadReceipts,
  getReceiptsStatus,
} from '../../controllers/v2/receipts'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router: express.Router = express.Router({ mergeParams: true })

const receiptController = new ReceiptController()

router
  .get(
    '/all/:network/:lockAddress',
    authenticatedMiddleware,
    lockManagerMiddleware,
    getReceiptsStatus
  )
  .post(
    '/all/:network/:lockAddress',
    authenticatedMiddleware,
    lockManagerMiddleware,
    createDownloadReceiptsRequest
  )
  .get(
    '/download/:network/:lockAddress',
    authenticatedMiddleware,
    lockManagerMiddleware,
    downloadReceipts
  )

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
