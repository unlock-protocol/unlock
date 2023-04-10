import express from 'express'
import {
  getLockMetadata,
  getKeyMetadata,
  updateLockMetadata,
  updateKeyMetadata,
  getBulkKeysMetadata,
  updateUsersMetadata,
  updateUserMetadata,
} from '../../controllers/v2/metadataController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router = express.Router({ mergeParams: true })

router.get('/:network/locks/:lockAddress', getLockMetadata)
router.get('/:network/locks/:lockAddress/keys/:keyId', getKeyMetadata)

router.post(
  '/:network/locks/:lockAddress/keys',
  authenticatedMiddleware,
  lockManagerMiddleware,
  getBulkKeysMetadata
)

router.put(
  '/:network/locks/:lockAddress',
  authenticatedMiddleware,
  lockManagerMiddleware,
  updateLockMetadata
)

router.put(
  '/:network/locks/:lockAddress/keys/:keyId',
  authenticatedMiddleware,
  lockManagerMiddleware,
  updateKeyMetadata
)

router.put('/users', authenticatedMiddleware, updateUsersMetadata)

router.put(
  '/:network/locks/:lockAddress/users/:userAddress',
  authenticatedMiddleware,
  updateUserMetadata
)

export default router
