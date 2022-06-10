import express from 'express'
import { GrantKeysController } from '../../controllers/v2/grantKeysController'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const grantKeysController = new GrantKeysController()

router.post(
  '/:network/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  grantKeysController.grantKeys
)

module.exports = router
