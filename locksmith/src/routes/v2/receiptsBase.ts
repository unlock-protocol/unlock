import express from 'express'

import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from './../../utils/middlewares/lockManager'
import { ReceiptsBaseController } from '../../controllers/v2/receiptsBaseController'

const router = express.Router({ mergeParams: true })

const receiptsController = new ReceiptsBaseController()

router.post(
  '/:network/:lockAddress',
  //authenticatedMiddleware,
  //lockManagerMiddleware,
  (req, res) => receiptsController.saveSupplier(req, res)
)

export default router
