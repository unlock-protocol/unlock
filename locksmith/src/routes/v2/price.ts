import express from 'express'
import {
  amount,
  isCardPaymentEnabledForLock,
  universalCard,
  total,
  getTotalChargesForLock,
} from '../../controllers/v2/priceController'
import { createCacheMiddleware } from '../../utils/middlewares/cacheMiddleware'

const router = express.Router({ mergeParams: true })

router.get('/charges/:network/locks/:lockAddress', getTotalChargesForLock)
router.get('/:network/price', amount)
router.get('/purchase/total', total)
router.get('/price/:network/:lock/card', universalCard)
router.get(
  '/credit-card-details/:network/locks/:lockAddress',
  createCacheMiddleware(),
  isCardPaymentEnabledForLock
)

export default router
