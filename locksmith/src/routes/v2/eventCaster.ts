import express from 'express'
import {
  createEvent,
  rsvpForEvent,
  deleteEvent,
  unrsvpForEvent,
} from '../../controllers/v2/eventCasterController'

const router = express.Router({ mergeParams: true })

router.post('/create-event', createEvent)
router.post('/delete-event', deleteEvent)
router.post('/:eventId/rsvp', rsvpForEvent)
router.post('/:eventId/unrsvp', unrsvpForEvent)

export default router
