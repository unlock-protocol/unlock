import express from 'express'
import { captchaMiddleware } from '../../utils/middlewares/recaptchaMiddleware'
import userController from '../../controllers/userController'

const router: express.Router = express.Router({ mergeParams: true })

router.post(
  '/:emailAddress/:selectedProvider/waas',
  captchaMiddleware,
  userController.retrieveWaasUuid
)

router.get('/:emailAddress/existNextAuth', userController.existNextAuth)
router.get(
  '/:emailAddress/send-verification-code',
  captchaMiddleware,
  userController.sendVerificationCode
)
router.post('/:emailAddress/verify-email-code', userController.verifyEmailCode)

export default router
