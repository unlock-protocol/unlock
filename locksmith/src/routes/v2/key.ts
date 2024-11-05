import express from 'express'
import KeyController from '../../controllers/v2/keyController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router: express.Router = express.Router({ mergeParams: true })

const keyController = new KeyController()

// Deprecated. Remove me by June 1st 2024
router.get(
  '/:network/locks/:lockAddress/keys',
  authenticatedMiddleware,
  (req, res) => {
    keyController.keys(req, res)
  }
)

router.get(
  '/:network/locks/:lockAddress/export-keys',
  authenticatedMiddleware,
  (req, res) => {
    keyController.exportKeys(req, res)
  }
)

router.get(
  '/:network/locks/:lockAddress/export-keys/:jobId',
  authenticatedMiddleware,
  (req, res) => {
    keyController.getExportedKeys(req, res)
  }
)

router.get(
  '/:network/locks/:lockAddress/keys-by-page',
  authenticatedMiddleware,
  (req, res) => {
    keyController.keysByPage(req, res)
  }
)

export default router
