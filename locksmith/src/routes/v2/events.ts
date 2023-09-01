import express from 'express'
import { getEventDetails } from '../../controllers/v2/eventsController'
const router = express.Router({ mergeParams: true })

router.get('/:network/:lockAddress', getEventDetails)

export default router
