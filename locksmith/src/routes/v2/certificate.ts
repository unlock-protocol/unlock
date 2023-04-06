import express from 'express'
import { generateCertificate } from '../../controllers/v2/certificateController'
import { lockManagerOrKeyOwnerMiddleware } from '../../utils/middlewares/lockManagerOrKeyOwner'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

router.get(
  '/:network/lock/:lockAddress/key/:keyId/generate',
  lockManagerOrKeyOwnerMiddleware,
  authenticatedMiddleware,
  generateCertificate
)

export default router
