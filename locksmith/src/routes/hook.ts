import express from 'express'
import { HookController } from '../controllers/hookController'
import { handlePublisher } from '../controllers/hubPublisherController'

const hookController = new HookController({
  leaseSeconds: {
    // 10 days default
    default: 864000,
    limit: 864000 * 9,
  },
})

const router: express.Router = express.Router({ mergeParams: true })

router.post(
  '/:network/locks',
  async (req, res) => await hookController.handle(req, res)
)

router.post(
  '/:network/locks/:lock/keys',
  async (req, res) => await hookController.handle(req, res)
)

router.post(
  '/:network/keys',
  async (req, res) => await hookController.handle(req, res)
)

router.post(
  '/:network/expired-keys',
  async (req, res) => await hookController.handle(req, res)
)

router.route('/:network/locks').get(handlePublisher).head(handlePublisher)
router.route('/:network/keys').get(handlePublisher).head(handlePublisher)
router
  .route('/:network/expired-keys')
  .get(handlePublisher)
  .head(handlePublisher)
router
  .route('/:network/locks/:lock/keys')
  .get(handlePublisher)
  .head(handlePublisher)

export default router
