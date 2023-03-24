import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'
import { connectStripe } from '../../controllers/v2/stripeController'

const router = express.Router({ mergeParams: true })

router.post(
  '/connect/:network/locks/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  connectStripe
)

export default router
