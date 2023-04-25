import express from 'express'
import {
  getLockBySlug,
  getSettings,
  updateSettings,
} from '../../controllers/v2/lockSettingController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router = express.Router({ mergeParams: true })

router.post(
  '/:network/locks/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  updateSettings
)

router.get(
  '/:network/locks/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  getSettings
)

router.get(
  '/slug/:slug',
  authenticatedMiddleware,
  lockManagerMiddleware,
  getLockBySlug
)

export default router
