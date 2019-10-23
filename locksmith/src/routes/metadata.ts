import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

let router = express.Router()
let metaDataController = require('../controllers/metadataController')

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

let lockOwnerMetaDataConfiguration = {
  name: 'LockMetaData',
  required: ['address', 'owner', 'timestamp'],
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

router.get(
  '/:address/:keyId',
  signatureValidationMiddleware.generateSignatureEvaluator(
    lockOwnerMetaDataConfiguration
  )
)

router.get('/:address/:keyId', metaDataController.data)
router.put('/:address/:keyId', metaDataController.updateKeyMetadata)
router.put('/:address', metaDataController.updateDefaults)
router.put('/:address/user/:userAddress', metaDataController.updateUserMetadata)

module.exports = router
