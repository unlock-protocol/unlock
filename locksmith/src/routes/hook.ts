import express from 'express'
import { HubPublisherController } from '../controllers/hubPublisherController'

const hubPublisherController = new HubPublisherController()

const router = express.Router({ mergeParams: true })

router.get('/:network/locks', (req, res) =>
  hubPublisherController.handle(req, res)
)
router.get('/:network/locks/:lock/keys', (req, res) =>
  hubPublisherController.handle(req, res)
)

router.head('/:network/locks', (req, res) =>
  hubPublisherController.handle(req, res)
)
router.head('/:network/locks/:lock/keys', (req, res) =>
  hubPublisherController.handle(req, res)
)

module.exports = router
