import express from 'express'
import {
  getEventDetails,
  saveEventDetails,
  getEventBySlug,
} from '../../controllers/v2/eventsController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
const router = express.Router({ mergeParams: true })

router.get('/:network/:lockAddress', getEventDetails)
router.get('/:slug', getEventBySlug)
router.post('/save', authenticatedMiddleware, saveEventDetails)

export default router
