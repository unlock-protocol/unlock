import express, { Request } from 'express'
import { ApplicationController } from '../../controllers/v2/applicationController'
import { authenticatedMiddleware, userOnlyMiddleware } from '../../utils/auth'

const router = express.Router({ mergeParams: true })

const appController = new ApplicationController()

router.use('/', authenticatedMiddleware, userOnlyMiddleware)
router.post('/', (req, res) => appController.createApplication(req, res))
router.get('/list', (req, res) => appController.listApplications(req, res))
router.delete('/:id', (req: Request<{ id: string }>, res) =>
  appController.deleteApplication(req, res)
)
router.put('/:id', (req: Request<{ id: string }>, res) =>
  appController.updateApplication(req, res)
)

module.exports = router
