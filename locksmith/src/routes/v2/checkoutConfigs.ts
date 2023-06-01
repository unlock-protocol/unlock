import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import {
  getCheckoutConfig,
  createOrUpdateCheckoutConfig,
  getCheckoutConfigsByUser,
  deleteCheckoutConfig,
} from '../../controllers/v2/checkoutController'
const router = express.Router({ mergeParams: true })

router.get('/list', getCheckoutConfigsByUser)
router.put('/:id?', authenticatedMiddleware, createOrUpdateCheckoutConfig)
router.get('/:id', getCheckoutConfig)
router.delete('/:id', authenticatedMiddleware, deleteCheckoutConfig)

export default router
