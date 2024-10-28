import express from 'express'
import {
  createEvent,
  rsvpForEvent,
} from '../../controllers/v2/eventCasterController'

const router = express.Router({ mergeParams: true })

router.post('/create-event', createEvent)
router.post('/:eventId/rsvp', rsvpForEvent)

export default router
