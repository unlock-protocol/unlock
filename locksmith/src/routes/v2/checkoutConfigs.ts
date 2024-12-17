import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import {
  getCheckoutConfig,
  createOrUpdateCheckoutConfig,
  deleteCheckoutConfig,
  getCheckoutConfigs,
  updateCheckoutHooks,
  getCheckoutHookJobs,
  addCheckoutHookJob,
  updateCheckoutHookJob,
} from '../../controllers/v2/checkoutController'
const router: express.Router = express.Router({ mergeParams: true })

router.get('/list', authenticatedMiddleware, getCheckoutConfigs)
router.get('/hooks/all', authenticatedMiddleware, getCheckoutHookJobs)
router.post('/hooks/:id', authenticatedMiddleware, addCheckoutHookJob)
router.put('/hooks/:id', authenticatedMiddleware, updateCheckoutHooks)
router.patch('/hooks/:id', authenticatedMiddleware, updateCheckoutHookJob)
router.put('/:id?', authenticatedMiddleware, createOrUpdateCheckoutConfig)
router.get('/:id', getCheckoutConfig)
router.delete('/:id', authenticatedMiddleware, deleteCheckoutConfig)

export default router
