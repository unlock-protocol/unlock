import express from 'express'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { VerifierController } from '../../controllers/v2/verifierController'
import { lockManagerMiddleware } from '../../utils/lockManager'
import { authenticatedMiddleware } from '../../utils/auth'

const router = express.Router({ mergeParams: true })
const web3Service = new Web3Service(networks)

const verifierController = new VerifierController({
  web3Service,
})

router.all('/', authenticatedMiddleware, lockManagerMiddleware)

router.get('/list/:network/:lockAddress', (req, res) =>
  verifierController.list(req, res)
)

router.put('/:network/:lockAddress/:verifierAddress', (req, res) =>
  verifierController.addVerifier(req, res)
)

router.delete('/:network/:lockAddress/:verifierAddress', (req, res) =>
  verifierController.removeVerifier(req, res)
)

module.exports = router
