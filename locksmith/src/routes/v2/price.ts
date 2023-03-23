import express from 'express'
import { amount, price } from '../../controllers/v2/priceController'

const router = express.Router({ mergeParams: true })

router.get('/:network/price', amount)
router.post('/purchase/price', price)

export default router
