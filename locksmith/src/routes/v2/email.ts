import express from 'express'
import { CustomEmailController } from '../../controllers/v2/customEmailController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router = express.Router({ mergeParams: true })

const customEmailController = new CustomEmailController()

router.post(
  '/:network/locks/:lockAddress/custom/:template',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => {
    customEmailController.saveCustomContent(req, res)
  }
)

router.get(
  '/:network/locks/:lockAddress/custom/:template',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => {
    customEmailController.getCustomContent(req, res)
  }
)

export default router
