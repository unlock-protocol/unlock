import express from 'express'
import { checkPrivyUser } from '../../controllers/v2/privyUserController'

const router: express.Router = express.Router({ mergeParams: true })

router.post('/check', checkPrivyUser)

export default router
