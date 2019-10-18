import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

var router = express.Router()

let metaDataConfiguration = {
  name: 'LockMetaData',
  required: ['name', 'description', 'owner', 'image'],
  signee: 'owner',
}

let keyMetaDataConfiguration = {
  name: 'KeyMetaData',
  required: ['owner'],
  signee: 'owner',
}

let userMetaDataConfiguration = {
  name: 'UserMetaData',
  required: ['owner', 'data'],
  signee: 'owner',
}

router.put(
  '/:address',
  signatureValidationMiddleware.generateProcessor(metaDataConfiguration)
)

router.put(
  '/:address/:keyId',
  signatureValidationMiddleware.generateProcessor(keyMetaDataConfiguration)
)

router.put(
  '/:address/user/:userAddress',
  signatureValidationMiddleware.generateProcessor(userMetaDataConfiguration)
)

var metaDataController = require('../controllers/metadataController')

router.get('/:address/:keyId', metaDataController.data)
router.put('/:address/:keyId', metaDataController.updateKeyMetadata)
router.put('/:address', metaDataController.updateDefaults)
router.put('/:address/user/:userAddress', metaDataController.updateUserMetadata)

module.exports = router
