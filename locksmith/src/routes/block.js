var express = require('express')

var router = express.Router()
var blockController = require('../controllers/blockController')

router.get('/:blockNumber', blockController.block_get)

module.exports = router
