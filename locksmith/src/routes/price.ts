import express from 'express'
import priceController from '../controllers/priceController'
const router = express.Router({ mergeParams: true })

router.get('/fiat/:lockAddress', priceController.fiatPrice)

export default router
