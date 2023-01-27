import express from 'express'
import { ContractsController } from '../../controllers/v2/contractsController'
import { authMiddleware } from '../../utils/middlewares/auth'
import { captchaMiddleware } from '../../utils/middlewares/recaptchaMiddleware'

const router = express.Router({ mergeParams: true })

const contractsController = new ContractsController()

router.post('/:network/lock', authMiddleware, captchaMiddleware, (req, res) => {
  contractsController.createLockContract(req, res)
})

export default router
