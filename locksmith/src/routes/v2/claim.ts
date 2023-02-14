import express from 'express'
import { claim } from '../../controllers/v2/claimController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { createGeoRestriction } from '../../utils/middlewares/geoRestriction'

const router = express.Router({ mergeParams: true })

// Disallow claim due to spam and bot activity
const geoRestriction = createGeoRestriction(['RU', 'UA'])

router.post(
  '/:network/locks/:lockAddress',
  geoRestriction,
  authenticatedMiddleware,
  claim
)

export default router
