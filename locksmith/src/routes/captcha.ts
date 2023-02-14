import express from 'express'

const router = express.Router({ mergeParams: true })
import captchaController from '../controllers/captchaController'

router.get('/', captchaController.sign)

export default router
