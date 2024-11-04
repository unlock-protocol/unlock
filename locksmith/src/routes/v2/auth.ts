import express from 'express'
import {
  nonce,
  login,
  logout,
  user,
  revoke,
  loginWithPrivy,
} from '../../controllers/v2/authController'
import {
  authenticatedMiddleware,
  userOnlyMiddleware,
} from '../../utils/middlewares/auth'

const router: express.Router = express.Router({ mergeParams: true })

router.get('/user', authenticatedMiddleware, user)
router.get('/nonce', nonce)
router.post('/login', login)
router.post('/privy', loginWithPrivy)
router.post('/logout', authenticatedMiddleware, userOnlyMiddleware, logout)
router.post('/revoke', revoke)

export default router
