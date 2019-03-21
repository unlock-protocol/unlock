var express = require('express')

var router = express.Router()
var transaction_controller = require('../controllers/transactionController')

router.post('/transaction', transaction_controller.transactionCreate)
router.get('/transactions', transaction_controller.transactionsGet)

module.exports = router
