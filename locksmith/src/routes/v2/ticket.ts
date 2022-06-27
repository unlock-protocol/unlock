import express from 'express'
import networks from '@unlock-protocol/networks'
import { TicketsController } from '../../controllers/v2/ticketsController'
import { keyOwnerMiddleware } from '../../utils/middlewares/keyOwnerMiddleware'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { isVerifierMiddleware } from '../../utils/middlewares/isVerifierMiddleware'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { lockManagerMiddleware } from './../../utils/middlewares/lockManager'

const router = express.Router({ mergeParams: true })

const web3Service = new Web3Service(networks)
const ticketsController = new TicketsController({
  web3Service,
})

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
  '/:network/:lockAddress/:tokenId/email',
  authenticatedMiddleware,
  lockManagerMiddleware,
  (req, res) => {
    ticketsController.sendEmail(req, res)
  }
)

module.exports = router
