import express from 'express'

import {
  authenticatedMiddleware,
  userOnlyMiddleware,
} from '../../utils/middlewares/auth'
import {
  subscribeToEmailList,
  unsubscribeFromEmailList,
} from '../../controllers/v2/emailSubscription'

const router = express.Router({ mergeParams: true })

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
  subscribeToEmailList
)

export default router
