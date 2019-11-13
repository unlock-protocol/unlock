import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router()
const metaDataController = require('../controllers/metadataController')

const metaDataConfiguration = {
  name: 'LockMetaData',
  required: ['name', 'description', 'owner', 'image'],
  signee: 'owner',
}

const keyMetaDataConfiguration = {
  name: 'KeyMetaData',
  required: ['owner'],
  signee: 'owner',
}

const userMetaDataConfiguration = {
  name: 'UserMetaData',
  required: ['owner', 'data'],
  signee: 'owner',
}

const lockOwnerMetaDataConfiguration = {
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

router.get(
  '/:address/keyHolderMetadata',
  signatureValidationMiddleware.generateSignatureEvaluator(
    lockOwnerMetaDataConfiguration
  )
)

router.get('/:address/keyHolderMetadata', metaDataController.keyHolderMetadata)
router.get('/:address/:keyId', metaDataController.data)
router.put('/:address/:keyId', metaDataController.updateKeyMetadata)
router.put('/:address', metaDataController.updateDefaults)
router.put('/:address/user/:userAddress', metaDataController.updateUserMetadata)

module.exports = router
