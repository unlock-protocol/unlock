const express = require('express')

const router = express.Router()
const blockController = require('../controllers/blockController')

router.get('/:blockNumber', blockController.blockGet)

module.exports = router
