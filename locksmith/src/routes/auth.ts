import express from 'express'
import AuthController from '../controllers/authController'

const router: express.Router = express.Router({ mergeParams: true })

router.post('/', AuthController.authorize)

export default router
