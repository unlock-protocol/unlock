import express from 'express'

import {
  authenticatedMiddleware,
  userOnlyMiddleware,
} from '../../utils/middlewares/auth'
import {
  reSubscribeToEmailList,
  unsubscribeFromEmailList,
} from '../../controllers/v2/emailSubscription'

const router: express.Router = express.Router({ mergeParams: true })

router.post(
  '/unsubscribe/:network/locks/:lockAddress',
  authenticatedMiddleware,
  userOnlyMiddleware,
  unsubscribeFromEmailList
)

router.post(
  '/subscribe/:network/locks/:lockAddress',
  authenticatedMiddleware,
  userOnlyMiddleware,
  reSubscribeToEmailList
)

export default router
