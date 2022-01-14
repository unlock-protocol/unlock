import express from 'express'
import {
  subscriptionHandler,
  publisherHandler,
} from '../controllers/hookController'

const router = express.Router({ mergeParams: true })

router.post('/:network/locks', subscriptionHandler)
router.post('/:network/locks/:lock/keys', subscriptionHandler)
router.get('/:network/locks', publisherHandler)
router.get('/:network/locks/:lock/keys', publisherHandler)
router.head('/:network/locks', publisherHandler)
router.head('/:network/locks/:lock/keys', publisherHandler)

module.exports = router
