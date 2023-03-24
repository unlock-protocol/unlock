import express from 'express'
import { LockSettingController } from '../../controllers/v2/lockSettingContoller'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router = express.Router({ mergeParams: true })

const lockSettingController = new LockSettingController()

router.post(
  '/:network/locks/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => {
    lockSettingController.updateSettings(req, res)
  }
)

router.get('/:network/locks/:lockAddress', (req, res) => {
  lockSettingController.getSettings(req, res)
})

export default router
