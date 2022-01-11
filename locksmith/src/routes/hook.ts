import express from 'express'
import { subscriptionHandler } from '../controllers/hookController'

const router = express.Router({ mergeParams: true })

router.post('/:network/locks', subscriptionHandler)
router.post('/:network/locks/:lock/keys', subscriptionHandler)

module.exports = router
