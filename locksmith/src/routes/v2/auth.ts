import express from 'express'
import {
  nonce,
  login,
  logout,
  user,
  revoke,
} from '../../controllers/v2/authController'
import {
  authenticatedMiddleware,
  userOnlyMiddleware,
} from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

router.get('/user', authenticatedMiddleware, user)
router.get('/nonce', nonce)
router.post('/login', login)
router.post('/logout', authenticatedMiddleware, userOnlyMiddleware, logout)
router.post('/revoke', revoke)

export default router
