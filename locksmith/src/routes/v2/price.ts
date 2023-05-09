import express from 'express'
import {
  amount,
  total,
  universalCard,
} from '../../controllers/v2/priceController'

const router = express.Router({ mergeParams: true })

router.get('/:network/price', amount)
router.get('/purchase/total', total)
router.get('/price/:network/:lock/card', universalCard)

export default router
