import express from 'express'
import priceController from '../controllers/priceController'
import { createCacheMiddleware } from '../utils/middlewares/cacheMiddleware'
const router = express.Router({ mergeParams: true })

const cache = createCacheMiddleware()

router.get('/fiat/:lockAddress', cache, priceController.fiatPrice)

export default router
