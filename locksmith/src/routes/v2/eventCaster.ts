import express, { RequestHandler } from 'express'
import {
  createEvent,
  rsvpForEvent,
  deleteEvent,
  unrsvpForEvent,
} from '../../controllers/v2/eventCasterController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { EVENT_CASTER_ADDRESS } from '../../utils/constants'

const router: express.Router = express.Router({ mergeParams: true })

export const eventCasterOnly: RequestHandler = (req, res, next) => {
  if (req.user?.walletAddress === EVENT_CASTER_ADDRESS) {
    return next()
  }
  res.status(403).send({
    message: 'Not Authorized',
  })
  return
}

router.post(
  '/create-event',
  authenticatedMiddleware,
  eventCasterOnly,
  createEvent
)
router.post(
  '/delete-event',
  authenticatedMiddleware,
  eventCasterOnly,
  deleteEvent
)
router.post(
  '/:eventId/rsvp',
  authenticatedMiddleware,
  eventCasterOnly,
  rsvpForEvent
)
router.post(
  '/:eventId/unrsvp',
  authenticatedMiddleware,
  eventCasterOnly,
  unrsvpForEvent
)

export default router
