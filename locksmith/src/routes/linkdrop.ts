import express from 'express'

var router = express.Router()
var transactionController = require('../controllers/transactionController')

router.post('/transaction', transactionController.transactionCreateLinkdrop)

module.exports = router
