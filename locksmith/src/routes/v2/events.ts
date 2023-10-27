import express from 'express'
import {
  getEventDetails,
  saveEventDetails,
  getEvent,
} from '../../controllers/v2/eventsController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { eventOrganizerMiddleware } from '../../utils/middlewares/eventOrganizerMiddleware'
const router = express.Router({ mergeParams: true })

router.get('/:network/:lockAddress', getEventDetails)
router.get('/:slug', getEvent)
router.post(
  '/save',
  authenticatedMiddleware,
  eventOrganizerMiddleware,
  saveEventDetails
)

export default router
