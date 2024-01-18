import express from 'express'
import { captchaMiddleware } from '../../utils/middlewares/recaptchaMiddleware'
import { rsvp } from '../../controllers/v2/rsvpController'

const router = express.Router({ mergeParams: true })

router.post('/:network/:lockAddress', captchaMiddleware, rsvp)

export default router
