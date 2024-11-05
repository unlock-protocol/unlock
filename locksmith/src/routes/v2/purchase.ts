import express from 'express'
import {
  createPaymentIntent,
  list,
  createSetupIntent,
  removePaymentMethods,
} from '../../controllers/v2/purchaseController'
import {
  authenticatedMiddleware,
  userOnlyMiddleware,
} from '../../utils/middlewares/auth'

const router: express.Router = express.Router({ mergeParams: true })

router.use('/', authenticatedMiddleware, userOnlyMiddleware)
router.post('/setup', createSetupIntent)
router.get('/list', list)
router.post('/intent/:network/locks/:lockAddress', createPaymentIntent)
router.delete('/payment-methods', removePaymentMethods)

export default router
