import express from 'express'
import { SubscriptionController } from '../../controllers/v2/subscriptionController'
import {
  authenticatedMiddleware,
  userOnlyMiddleware,
} from '../../utils/middlewares/auth'
import { lockManagerOrKeyOwnerMiddleware } from '../../utils/middlewares/lockManagerOrKeyOwner'

const router: express.Router = express.Router({ mergeParams: true })

const subscriptionController = new SubscriptionController()

router.get(
  '/:network/locks/:lockAddress/keys/:keyId',
  authenticatedMiddleware,
  userOnlyMiddleware,
  lockManagerOrKeyOwnerMiddleware,
  (req, res) => {
    subscriptionController.getSubscription(req, res)
  }
)

router.delete(
  '/:network/locks/:lockAddress/keys/:keyId',
  authenticatedMiddleware,
  userOnlyMiddleware,
  (req, res) => {
    subscriptionController.cancelStripeSubscription(req, res)
  }
)

export default router
