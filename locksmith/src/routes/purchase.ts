let express = require('express')

let router = express.Router()
let purchaseController = require('../controllers/purchaseController')

router.post('/', purchaseController.purchase)

module.exports = router
