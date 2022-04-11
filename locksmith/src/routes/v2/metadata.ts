import express from 'express'
import { MetadataController } from '../../controllers/v2/metadataController'
import { authenticatedMiddleware } from '../../utils/jwt'

const router = express.Router({ mergeParams: true })

const metadataController = new MetadataController()

router.get('/:network/locks/:lockAddress', (req, res) =>
  metadataController.getLockMetadata(req, res)
)

router.put(
  '/:network/locks/:lockAddress',
  authenticatedMiddleware,
  (req, res) => metadataController.updateLockMetadata(req, res)
)

router.get('/:network/locks/:lockAddress/keys/:keyId', (req, res) => {
  metadataController.getKeyMetadata(req, res)
})

router.put(
  '/:network/locks/:lockAddress/keys/:keyId',
  authenticatedMiddleware,
  (req, res) => {
    metadataController.updateKeyMetadata(req, res)
  }
)

router.get(
  '/:network/locks/:lockAddress/users/:userAddress/keys/:keyId',
  (req, res) => {
    metadataController.getUserMetadata(req, res)
  }
)

router.put('/:network/locks/:lockAddress/users/:keyId', (req, res) =>
  metadataController.updateUserMetadata(req, res)
)

module.exports = router
