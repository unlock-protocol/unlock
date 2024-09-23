import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import {
  addEventToCollection,
  createEventCollection,
  getEventCollection,
  updateEventCollection,
} from '../../controllers/v2/eventCollectionController'

const router = express.Router({ mergeParams: true })

router.post('/', createEventCollection)
router.get('/:slug', getEventCollection)
router.put('/:slug', authenticatedMiddleware, updateEventCollection)

router.post('/:slug/events', addEventToCollection)

export default router
