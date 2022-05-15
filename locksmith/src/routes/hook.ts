import express from 'express'
import { HookController } from '../controllers/hookController'
import { HubPublisherController } from '../controllers/hubPublisherController'

const hookController = new HookController({
  leaseSeconds: {
    // 10 days default
    default: 864000,
    limit: 864000 * 9,
  },
})

const hubPublisherController = new HubPublisherController()

const router = express.Router({ mergeParams: true })

router.post('/:network/locks', (req, res) => hookController.handle(req, res))

router.post('/:network/locks/:lock/keys', (req, res) =>
  hookController.handle(req, res)
)

router.post('/:network/keys', (req, res) => hookController.handle(req, res))

router.get('/:network/locks', (req, res) =>
  hubPublisherController.handle(req, res)
)
router.get('/:network/locks/:lock/keys', (req, res) =>
  hubPublisherController.handle(req, res)
)
router.get('/:network/keys', (req, res) =>
  hubPublisherController.handle(req, res)
)

router.head('/:network/locks', (req, res) =>
  hubPublisherController.handle(req, res)
)
router.head('/:network/locks/:lock/keys', (req, res) =>
  hubPublisherController.handle(req, res)
)

router.head('/:network/keys', (req, res) =>
  hubPublisherController.handle(req, res)
)

module.exports = router
