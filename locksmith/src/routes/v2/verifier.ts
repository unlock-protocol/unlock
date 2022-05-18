import express from 'express'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { VerifierController } from '../../controllers/v2/verifierController'
import { lockManagerMiddleware } from '../../utils/lockManager'

const router = express.Router({ mergeParams: true })
const web3Service = new Web3Service(networks)

const verifierController = new VerifierController({
  web3Service,
})

router.get('/list/:network/:lockAddress', lockManagerMiddleware, (req, res) =>
  verifierController.list(req, res)
)

router.put(
  '/:network/:lockAddress/:verifierAddress',
  lockManagerMiddleware,
  (req, res) => verifierController.addVerifier(req, res)
)

router.delete(
  '/:network/:lockAddress/:verifierAddress',
  lockManagerMiddleware,
  (req, res) => verifierController.removeVerifier(req, res)
)

module.exports = router
