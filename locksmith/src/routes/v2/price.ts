import express from 'express'
import { PriceController } from '../../controllers/v2/priceController'

const router = express.Router({ mergeParams: true })

const priceController = new PriceController()

router.get('/:network/price', (req, res) => {
  priceController.amount(req, res)
})

export default router
