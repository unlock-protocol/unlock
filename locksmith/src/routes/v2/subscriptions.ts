import express from 'express'
import { SubscriptionController } from '../../controllers/v2/subscriptionController'
import {
  authenticatedMiddleware,
  userOnlyMiddleware,
} from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const subscriptionController = new SubscriptionController()

router.get(
  '/:network/locks/:lockAddress/keys/:keyId',
  authenticatedMiddleware,
  userOnlyMiddleware,
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
