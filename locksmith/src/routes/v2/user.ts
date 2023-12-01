import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import { update } from '../../controllers/v2/userController'

const router = express.Router({ mergeParams: true })

router.put('/', authenticatedMiddleware, update)

export default router
