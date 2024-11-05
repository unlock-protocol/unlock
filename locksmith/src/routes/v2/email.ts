import express from 'express'
import {
  getCustomContent,
  saveCustomContent,
  sendCustomEmail,
  sendEventInvite,
} from '../../controllers/v2/customEmailController'
import { eventOrganizerMiddleware } from '../../utils/middlewares/eventOrganizerMiddleware'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router: express.Router = express.Router({ mergeParams: true })

router.post(
  '/:network/locks/:lockAddress/custom/send',
  authenticatedMiddleware,
  lockManagerMiddleware,
  sendCustomEmail
)

router.post(
  '/:slug/invite',
  authenticatedMiddleware,
  eventOrganizerMiddleware,
  sendEventInvite
)

router.post(
  '/:network/locks/:lockAddress/custom/:template',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => {
    saveCustomContent(req, res)
  }
)

router.get(
  '/:network/locks/:lockAddress/custom/:template',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => {
    getCustomContent(req, res)
  }
)

export default router
