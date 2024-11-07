import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'
import {
  connectStripe,
  getConnectionsForManager,
} from '../../controllers/v2/stripeController'

const router: express.Router = express.Router({ mergeParams: true })

router.post(
  '/connect/:network/locks/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  connectStripe
)

router.get('/connections', authenticatedMiddleware, getConnectionsForManager)

export default router
