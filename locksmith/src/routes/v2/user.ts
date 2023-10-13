import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { updateUser } from '../../controllers/userController'

const router = express.Router({ mergeParams: true })

router.put('/', authenticatedMiddleware, updateUser)

export default router
