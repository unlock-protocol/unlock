import express from 'express'
import { TicketsController } from '../../controllers/v2/ticketsController'
import { keyOwnerMiddleware } from '../../utils/middlewares/keyOwnerMiddleware'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { isVerifierMiddleware } from '../../utils/middlewares/isVerifierMiddleware'
import { lockManagerMiddleware } from './../../utils/middlewares/lockManager'

const router = express.Router({ mergeParams: true })

const ticketsController = new TicketsController()

router.get(
  '/:network/:lockAddress/:tokenId/sign',
  authenticatedMiddleware,
  keyOwnerMiddleware,
  ticketsController.sign
)

router.put(
  '/:network/lock/:lockAddress/key/:keyId/check',
  authenticatedMiddleware,
  isVerifierMiddleware,
  (req, res) => {
    ticketsController.markTicketAsCheckIn(req, res)
  }
)

router.post(
  ':/network/:lockAddress/:tokenId/email',
  authenticatedMiddleware,
  keyOwnerMiddleware,
  lockManagerMiddleware,
  (req, res) => {
    ticketsController.sendEmail(req, res)
  }
)

module.exports = router
