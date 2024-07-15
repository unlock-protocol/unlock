import express from 'express'
import { captchaMiddleware } from '../../utils/middlewares/recaptchaMiddleware'
import userController from '../../controllers/userController'

const router = express.Router({ mergeParams: true })

router.post(
  '/:emailAddress/:selectedProvider/waas',
  captchaMiddleware,
  userController.retrieveWaasUuid
)

router.get('/:emailAddress/existNextAuth', userController.existNextAuth)
router.get(
  '/:emailAddress/sendVerificationCode',
  userController.sendVerificationCode
)

export default router
