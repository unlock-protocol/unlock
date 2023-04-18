import express from 'express'
import { amount, total } from '../../controllers/v2/priceController'

const router = express.Router({ mergeParams: true })

router.get('/:network/price', amount)
router.get('/purchase/total', total)

export default router
