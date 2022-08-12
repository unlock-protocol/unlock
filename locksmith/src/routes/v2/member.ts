import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import express from 'express'
import MemberController from '../../controllers/v2/memberController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const web3Service = new Web3Service(networks)
const memberController = new MemberController({
  web3Service,
})

router.get(
  '/:network/locks/:lockAddress/list',
  authenticatedMiddleware,
  (req, res) => {
    memberController.list(req, res)
  }
)

module.exports = router
