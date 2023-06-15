import express from 'express'
import {
  createPaymentIntent,
  createOnRampSession,
  list,
  createSetupIntent,
  removePaymentMethods,
  captureOnRamp,
  captureExtension,
} from '../../controllers/v2/purchaseController'
import {
  authenticatedMiddleware,
  userOnlyMiddleware,
} from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

router.use('/', authenticatedMiddleware, userOnlyMiddleware)
router.post('/setup', createSetupIntent)
router.get('/list', list)
router.post('/intent/:network/locks/:lockAddress', createPaymentIntent)
router.post('/onramp/:network/locks/:lockAddress', createOnRampSession)
router.post('/onramp/:session/capture', captureOnRamp)
router.delete('/payment-methods', removePaymentMethods)
router.post('/extension/capture', captureExtension)

export default router
