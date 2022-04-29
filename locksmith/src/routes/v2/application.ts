import express, { Request } from 'express'
import { ApplicationController } from '../../controllers/v2/applicationController'
import { authenticatedMiddleware } from '../../utils/auth'

const router = express.Router({ mergeParams: true })

const appController = new ApplicationController()

router.post('/', authenticatedMiddleware, (req, res) =>
  appController.createApplication(req, res)
)
router.get('/list', authenticatedMiddleware, (req, res) =>
  appController.listApplications(req, res)
)
router.delete(
  '/:id',
  authenticatedMiddleware,
  (req: Request<{ id: string }>, res) =>
    appController.deleteApplication(req, res)
)
router.put(
  '/:id',
  authenticatedMiddleware,
  (req: Request<{ id: string }>, res) =>
    appController.updateApplication(req, res)
)

module.exports = router
