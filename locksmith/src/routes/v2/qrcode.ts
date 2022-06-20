import express from 'express'
import { keyOwnerMiddleware } from './../../utils/middlewares/keyOwnerMiddleware'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { QrCodeController } from '../../controllers/v2/qrCodeController'

const router = express.Router({ mergeParams: true })

const qrCodeController = new QrCodeController()

router.get(
  '/:network/:lockAddress/:tokenId/generate',
  authenticatedMiddleware,
  keyOwnerMiddleware,
  (req, res) => {
    return qrCodeController.generate(req, res)
  }
)

module.exports = router
