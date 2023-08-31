import express from 'express'
import {
  getEventDetails,
  saveEventDetails,
} from '../../controllers/v2/eventsController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
const router = express.Router({ mergeParams: true })

router.get('/:network/:lockAddress', getEventDetails)
router.post('/save', authenticatedMiddleware, saveEventDetails)

export default router
