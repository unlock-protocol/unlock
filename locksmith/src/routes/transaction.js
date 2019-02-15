var express = require('express')

var router = express.Router()
var transaction_controller = require('../controllers/transactionController')

router.post('/transaction', transaction_controller.transaction_creation)
router.get('/transactions', transaction_controller.transaction_get)

module.exports = router
