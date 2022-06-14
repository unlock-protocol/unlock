import express from 'express'
import { TicketsController } from '../../controllers/v2/ticketsController'
import { keyOwnerMiddleware } from '../../utils/middlewares/keyOwnerMiddleware'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const ticketsController = new TicketsController()

router.get(
  '/:network/:lockAddress/:tokenId/sign',
  authenticatedMiddleware,
  keyOwnerMiddleware,
  ticketsController.sign
)

module.exports = router
