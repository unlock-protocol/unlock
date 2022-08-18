import express from 'express'
import KeyController from '../../controllers/v2/keyController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const keyController = new KeyController()

router.get(
  '/:network/locks/:lockAddress/keys',
  authenticatedMiddleware,
  (req, res) => {
    keyController.keys(req, res)
  }
)

module.exports = router
