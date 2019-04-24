import express from 'express'

var router = express.Router()
var priceController = require('../controllers/priceController')

router.get('/:lockAddress', priceController.price)

module.exports = router
