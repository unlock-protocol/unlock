import express from 'express'
import {
  getEventDetailsByLock,
  saveEventDetails,
  getEvent,
} from '../../controllers/v2/eventsController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { eventOrganizerMiddleware } from '../../utils/middlewares/eventOrganizerMiddleware'
const router = express.Router({ mergeParams: true })

router.get('/:network/:lockAddress', getEventDetailsByLock)
router.get('/:slug', getEvent)
router.post(
  '/save',
  authenticatedMiddleware,
  eventOrganizerMiddleware,
  saveEventDetails
)

export default router
