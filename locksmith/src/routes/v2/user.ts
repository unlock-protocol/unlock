import express from 'express'
import userController from '../../controllers/userController'

const router: express.Router = express.Router({ mergeParams: true })

router.get('/:emailAddress/existNextAuth', userController.existNextAuth)

export default router
