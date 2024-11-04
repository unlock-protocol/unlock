import express from 'express'
import {
  TicketsController,
  generateTicket,
  getTicket,
} from '../../controllers/v2/ticketsController'
import { keyOwnerMiddleware } from '../../utils/middlewares/keyOwnerMiddleware'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from './../../utils/middlewares/lockManager'
import { lockManagerOrKeyOwnerMiddleware } from '../../utils/middlewares/lockManagerOrKeyOwner'
import {
  isEventVerifierOrManagerMiddleware,
  isLockVerifierMiddleware,
} from '../../utils/middlewares/isVerifierMiddleware'

const router: express.Router = express.Router({ mergeParams: true })

const ticketsController = new TicketsController()

router.get(
  '/:network/:lockAddress/:keyId/sign',
  authenticatedMiddleware,
  keyOwnerMiddleware,
  (req, res) => ticketsController.sign(req, res)
)

// Deprecated
router.put(
  '/:network/lock/:lockAddress/key/:keyId/check',
  authenticatedMiddleware,
  isLockVerifierMiddleware,
  (req, res) => {
    ticketsController.markTicketAsCheckIn(req, res)
  }
)

router.get('/:eventSlug/:network/lock/:lockAddress/key/:keyId', getTicket)

router.put(
  '/:eventSlug/:network/lock/:lockAddress/key/:keyId/check',
  authenticatedMiddleware,
  isEventVerifierOrManagerMiddleware,
  (req, res) => {
    ticketsController.markTicketAsCheckIn(req, res)
  }
)

// TODO: move on lock level, this is now sending email attachments based on lockType and not specific for ticket
router.post(
  '/:network/:lockAddress/:keyId/email',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => {
    ticketsController.sendEmail(req, res)
  }
)

router.get(
  '/:network/:lockAddress/:keyId/qr',
  authenticatedMiddleware,
  lockManagerOrKeyOwnerMiddleware,
  (req, res) => {
    ticketsController.getQrCode(req, res)
  }
)

router.get(
  '/:network/:lockAddress/:keyId/verification',
  authenticatedMiddleware,
  lockManagerOrKeyOwnerMiddleware,
  (req, res) => {
    ticketsController.getVerificationUrl(req, res)
  }
)

router.get(
  '/:network/lock/:lockAddress/key/:keyId/generate',
  authenticatedMiddleware,
  generateTicket
)

// DEPRECATED
router.get('/:network/lock/:lockAddress/key/:keyId', getTicket)

export default router
