import express from 'express'
import KeyController from '../../controllers/v2/keyController'
//import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const memberController = new KeyController()

router.get(
  '/:network/locks/:lockAddress/keys',
  //authenticatedMiddleware,
  (req, res) => {
    memberController.keys(req, res)
  }
)

module.exports = router
