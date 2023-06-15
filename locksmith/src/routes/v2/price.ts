import express from 'express'
import {
  amount,
  isCardPaymentEnabledForLock,
  universalCard,
  total,
  getTotalChargesForLock,
} from '../../controllers/v2/priceController'

const router = express.Router({ mergeParams: true })

router.get('/charges/:network/locks/:lockAddress', getTotalChargesForLock)
router.get('/:network/price', amount)
router.get('/purchase/total', total)
router.get('/price/:network/:lock/card', universalCard)
router.get(
  '/credit-card-details/:network/locks/:lockAddress',
  isCardPaymentEnabledForLock
)

export default router
