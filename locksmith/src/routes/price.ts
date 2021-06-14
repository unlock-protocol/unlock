import express from 'express'

const router = express.Router({ mergeParams: true })
const priceController = require('../controllers/priceController')

router.get('/fiat/:lockAddress', priceController.fiatPrice)

module.exports = router
