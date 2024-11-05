import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import {
  getCheckoutConfig,
  createOrUpdateCheckoutConfig,
  deleteCheckoutConfig,
  getCheckoutConfigs,
} from '../../controllers/v2/checkoutController'
const router: express.Router = express.Router({ mergeParams: true })

router.get('/list', authenticatedMiddleware, getCheckoutConfigs)
router.put('/:id?', authenticatedMiddleware, createOrUpdateCheckoutConfig)
router.get('/:id', getCheckoutConfig)
router.delete('/:id', authenticatedMiddleware, deleteCheckoutConfig)

export default router
