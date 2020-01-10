import express from 'express'

const router = express.Router()
const transactionController = require('../controllers/transactionController')

router.post('/transaction', transactionController.transactionCreateLinkdrop)

module.exports = router
