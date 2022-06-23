import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'
import MetadataController from '../controllers/metadataController'

const router = express.Router({ mergeParams: true })

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

const readUserMetaDataConfiguration = {
  name: 'UserMetaData',
  required: ['owner', 'timestamp'],
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
  '/:address/user/:userAddress',
  signatureValidationMiddleware.generateSignatureEvaluator(
    readUserMetaDataConfiguration
  )
)

router.get(
  '/:address/keyHolderMetadata',
  signatureValidationMiddleware.generateSignatureEvaluator(
    lockOwnerMetaDataConfiguration
  )
)

router.get('/:address/keyHolderMetadata', MetadataController.keyHolderMetadata)
router.put('/:address/:keyId', MetadataController.updateKeyMetadata)
router.put('/:address', MetadataController.updateDefaults)
router.put('/:address/user/:userAddress', MetadataController.updateUserMetadata)
router.get('/:address/user/:userAddress', MetadataController.readUserMetadata)

module.exports = router
