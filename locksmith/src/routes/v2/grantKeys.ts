import express from 'express'
import { GrantKeysController } from '../../controllers/v2/grantKeysController'
import { lockManagerOrKeyGranterMiddleware } from '../../utils/middlewares/lockManagerOrKeyGranter'
import {
  authenticatedMiddleware,
  applicationOnlyMiddleware,
} from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const grantKeysController = new GrantKeysController()

router.post(
  '/:network/:lockAddress',
  authenticatedMiddleware,
  applicationOnlyMiddleware,
  lockManagerOrKeyGranterMiddleware,
  grantKeysController.grantKeys
)

module.exports = router
