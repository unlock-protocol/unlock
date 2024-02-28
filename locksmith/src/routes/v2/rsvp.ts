import express from 'express'
import { captchaMiddleware } from '../../utils/middlewares/recaptchaMiddleware'
import { rsvp, update } from '../../controllers/v2/rsvpController'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

router.post('/:network/:lockAddress', captchaMiddleware, rsvp)
router.post(
  '/:network/:lockAddress/deny/:userAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  update('denied')
)

router.post(
  '/:network/:lockAddress/approve/:userAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  update('approved')
)

export default router
