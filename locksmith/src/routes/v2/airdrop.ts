import express from 'express'
import { createTransferCode } from '../../controllers/AirdropController'
import { createRateLimitMiddleware } from '../../utils/middlewares/rateLimit'
import { captchaMiddleware } from '../../utils/middlewares/recaptchaMiddleware'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
const router = express.Router({ mergeParams: true })

const rateLimiter = createRateLimitMiddleware({
  prefix: 'create_transfer_code',
  // 10 requests within 5 minutes.
  duration: 60 * 5,
  requests: 10,
})

router.post(
  '/:network/locks/:lockAddress/keys/:keyId/transfer',
  authenticatedMiddleware,
  rateLimiter,
  createTransferCode
)

export default router
