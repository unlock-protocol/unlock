import express from 'express'

var router = express.Router()
var metaDataController = require('../controllers/metadataController')

router.get('/:keyId', metaDataController.data)

module.exports = router
