import express from 'express'

var router = express.Router()
var transactionController = require('../controllers/transactionController')

router.post('/transaction', transactionController.transactionCreate)
router.get('/transactions', transactionController.transactionsGet)
router.get('/transaction/:hash/odds', transactionController.transactionGetOdds)

module.exports = router
