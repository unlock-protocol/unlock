import express from 'express'
import {
  getEventDetails,
  saveEventDetails,
} from '../../controllers/v2/eventsController'
const router = express.Router({ mergeParams: true })

router.get('/:network/:lockAddress', getEventDetails)
router.post('/save', saveEventDetails)

export default router
