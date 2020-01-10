import express from 'express'

const router = express.Router()
const priceController = require('../controllers/priceController')

router.get('/:lockAddress', priceController.price)

module.exports = router
