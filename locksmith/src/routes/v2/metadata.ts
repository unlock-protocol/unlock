import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import express from 'express'
import { MetadataController } from '../../controllers/v2/metadataController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router = express.Router({ mergeParams: true })

const web3Service = new Web3Service(networks)
const metadataController = new MetadataController({
  web3Service,
})

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

router.post('/:network/locks/:lockAddress/users/:userAddress', (req, res) =>
  metadataController.createUserMetadata(req, res)
)

router.post('/:network/users', (req, res) =>
  metadataController.createBulkUserMetadata(req, res)
)

router.put(
  '/:network/locks/:lockAddress/users/:userAddress',
  authenticatedMiddleware,
  (req, res) => metadataController.updateUserMetadata(req, res)
)

router.get(
  '/:network/locks/:lockAddress/keys',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => {
    metadataController.getBulkKeysMetadata(req, res)
  }
)

module.exports = router
