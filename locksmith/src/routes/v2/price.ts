import express from 'express'
import {
  amount,
  getCreditCardDetails,
  total,
} from '../../controllers/v2/priceController'

const router = express.Router({ mergeParams: true })

router.get('/:network/price', amount)
router.get('/purchase/total', total)
router.get(
  '/:network/locks/:lockAddress/credit-card-details',
  getCreditCardDetails
)

export default router
