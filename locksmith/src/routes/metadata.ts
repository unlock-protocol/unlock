import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

var router = express.Router()

let metaDataConfiguration = {
  name: 'LockMetaData',
  required: ['address', 'name', 'description', 'owner', 'image'],
  signee: 'owner',
}

router.put(
  '/:lockAddress',
  signatureValidationMiddleware.generateProcessor(metaDataConfiguration)
)

var metaDataController = require('../controllers/metadataController')

router.get('/:lockAddress/:keyId', metaDataController.data)
router.put('/:lockAddress', metaDataController.updateDefaults)

module.exports = router
