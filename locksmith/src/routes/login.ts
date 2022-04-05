import express from 'express'
import { LoginController } from '../controllers/loginController'

const router = express.Router({ mergeParams: true })

const loginController = new LoginController()

router.post('/login', loginController.login)
router.get('/nonce', loginController.nonce)
router.get('/message', loginController.message)

module.exports = router
