import express from 'express'
import { claim } from '../../controllers/v2/claimController'
import { createGeoRestriction } from '../../utils/middlewares/geoRestriction'
import { createRateLimitMiddleware } from '../../utils/middlewares/rateLimit'

const router = express.Router({ mergeParams: true })

const rateLimiter = createRateLimitMiddleware({
  prefix: 'claim',
  // 10 requests within 5 minutes.
  duration: 60 * 5,
  requests: 10,
})

// Disallow claim due to spam and bot activity
const geoRestriction = createGeoRestriction(['RU', 'UA'])

router.post('/:network/locks/:lockAddress', geoRestriction, rateLimiter, claim)
export default router
