import express from 'express'

const router = express.Router({ mergeParams: true })
const transactionController = require('../controllers/transactionController')

router.post('/transaction', transactionController.transactionCreate)
router.get('/transactions', transactionController.transactionsGet)
router.get('/transaction/:hash/odds', transactionController.transactionGetOdds)

module.exports = router
