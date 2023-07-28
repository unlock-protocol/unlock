import express from 'express'
import { ContractsController } from '../../controllers/v2/contractsController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { captchaMiddleware } from '../../utils/middlewares/recaptchaMiddleware'

const router = express.Router({ mergeParams: true })

const contractsController = new ContractsController()

router.post(
  '/:network/lock',
  authenticatedMiddleware,
  captchaMiddleware,
  (req, res) => {
    contractsController.createLockContract(req, res)
  }
)

export default router
