import express from 'express'
import { claim } from '../../controllers/v2/claimController'
import { createGeoRestriction } from '../../utils/middlewares/geoRestriction'

const router = express.Router({ mergeParams: true })

// Disallow claim due to spam and bot activity
const geoRestriction = createGeoRestriction(['RU', 'UA'])

router.post('/:network/locks/:lockAddress', geoRestriction, claim)
export default router
