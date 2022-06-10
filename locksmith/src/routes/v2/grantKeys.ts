import express from 'express'
import { GrantKeysController } from '../../controllers/v2/grantKeysController'
import { lockManagerMiddleware } from '../../utils/lockManager'
import { authenticatedMiddleware } from '../../utils/auth'

const router = express.Router({ mergeParams: true })

const grantKeysController = new GrantKeysController()

router.use('/', authenticatedMiddleware, lockManagerMiddleware)

router.post('/:network/locks/:lockAddress', (req, res) =>
  grantKeysController.grantKeys(req, res)
)

module.exports = router
