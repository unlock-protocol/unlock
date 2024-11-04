import express from 'express'
import { generateCertificate } from '../../controllers/v2/certificateController'
import { lockManagerOrKeyOwnerMiddleware } from '../../utils/middlewares/lockManagerOrKeyOwner'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router: express.Router = express.Router({ mergeParams: true })

router.get(
  '/:network/lock/:lockAddress/key/:keyId/generate',
  authenticatedMiddleware,
  lockManagerOrKeyOwnerMiddleware,
  generateCertificate
)

export default router
