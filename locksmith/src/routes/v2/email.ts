import express from 'express'
import {
  CustomEmailController,
  sendCustomEmail,
} from '../../controllers/v2/customEmailController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { lockManagerMiddleware } from '../../utils/middlewares/lockManager'

const router = express.Router({ mergeParams: true })

const customEmailController = new CustomEmailController()

router
  .use(authenticatedMiddleware, lockManagerMiddleware)
  .get('/:network/locks/:lockAddress/custom/:template', (req, res) => {
    customEmailController.getCustomContent(req, res)
  })
  .post('/:network/locks/:lockAddress/custom/:template', (req, res) => {
    customEmailController.saveCustomContent(req, res)
  })
  .post('/:network/locks/:lockAddress/custom/send', sendCustomEmail)

export default router
