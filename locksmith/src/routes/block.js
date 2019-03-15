var express = require('express')

var router = express.Router()
var blockController = require('../controllers/blockController')

router.get('/:blockNumber', blockController.blockGet)

module.exports = router
