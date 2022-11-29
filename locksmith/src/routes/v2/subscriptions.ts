import express from 'express'
import { SubscriptionController } from '../../controllers/v2/subscriptionController'
import { authMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const subscriptionController = new SubscriptionController()

router.get(
  '/:network/locks/:lockAddress/keys/:keyId',
  authMiddleware,
  (req, res) => {
    subscriptionController.getSubscription(req, res)
  }
)

router.delete(
  '/:network/locks/:lockAddress/keys/:keyId',
  authMiddleware,
  (req, res) => {
    subscriptionController.cancelSubscription(req, res)
  }
)

module.exports = router
