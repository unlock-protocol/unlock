import express from 'express'
import { ContractsController } from '../../controllers/v2/contractsController'
import { authMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const contractsController = new ContractsController()

router.post('/:network/lock', authMiddleware, (req, res) => {
  contractsController.createLockContract(req, res)
})

module.exports = router
