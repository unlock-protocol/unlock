import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import {
  addEventToCollection,
  addManagerAddress,
  approveEvent,
  bulkApproveEvents,
  bulkRemoveEvents,
  createEventCollection,
  getEventCollection,
  getUnapprovedEventsForCollection,
  removeEventFromCollection,
  removeManagerAddress,
  updateEventCollection,
} from '../../controllers/v2/eventCollectionController'

const router: express.Router = express.Router({ mergeParams: true })

// Create a new event collection
router.post('/', authenticatedMiddleware, createEventCollection)

// Retrieve an event collection
router.get('/:slug', getEventCollection)

// Update an event collection
router.put('/:slug', authenticatedMiddleware, updateEventCollection)

// Add an event to a collection
router.post('/:slug/events', authenticatedMiddleware, addEventToCollection)

// Remove an event from a collection
router.delete(
  '/:slug/events',
  authenticatedMiddleware,
  removeEventFromCollection
)

// Add a manager to a collection
router.post('/:slug/managers', authenticatedMiddleware, addManagerAddress)

// Remove a manager from a collection
router.delete('/:slug/managers', authenticatedMiddleware, removeManagerAddress)

// Get unapproved events for a collection
router.get(
  '/:slug/unapproved-events',
  authenticatedMiddleware,
  getUnapprovedEventsForCollection
)

// Approve a single event
router.post('/:slug/events/approve', authenticatedMiddleware, approveEvent)

// Bulk approve events
router.post(
  '/:slug/events/bulk-approve',
  authenticatedMiddleware,
  bulkApproveEvents
)

// Bulk remove events
router.delete(
  '/:slug/events/bulk-remove',
  authenticatedMiddleware,
  bulkRemoveEvents
)

export default router
