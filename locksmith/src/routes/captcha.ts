import express from 'express'
import captchaController from '../controllers/captchaController'

const router: express.Router = express.Router({ mergeParams: true })

router.get('/', captchaController.sign)

export default router
