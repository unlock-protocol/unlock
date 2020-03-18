import express from 'express'

const router = express.Router()
const priceController = require('../controllers/priceController')

router.get('/:lockAddress', priceController.price)
router.get('/fiat/:lockAddress', priceController.fiatPrice)

module.exports = router
