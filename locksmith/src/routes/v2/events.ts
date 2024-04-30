import express from 'express'
import {
  getEventDetailsByLock,
  saveEventDetails,
  getEvent,
  getAllEvents,
  createEventTokenGatedRoom,
} from '../../controllers/v2/eventsController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { eventOrganizerMiddleware } from '../../utils/middlewares/eventOrganizerMiddleware'
const router = express.Router({ mergeParams: true })

router.get('/:network/:lockAddress', getEventDetailsByLock)
router.get('/:slug', getEvent)
router.get('/', getAllEvents)
router.post(
  '/save',
  authenticatedMiddleware,
  eventOrganizerMiddleware,
  saveEventDetails
)
router.post('/create-room', createEventTokenGatedRoom)

export default router
