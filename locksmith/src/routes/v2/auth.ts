import express from 'express'
import { AuthController } from '../../controllers/v2/authController'
import { authenticatedMiddleware } from '../../utils/jwt'

const router = express.Router({ mergeParams: true })

const authController = new AuthController()

router.get('/nonce', (req, res) => authController.nonce(req, res))
router.get('/user', authenticatedMiddleware, (req, res) =>
  authController.user(req, res)
)
router.post('/login', (req, res) => authController.login(req, res))
router.post('/token', (req, res) => authController.token(req, res))
router.post('/revoke', (req, res) => authController.revokeToken(req, res))

module.exports = router
