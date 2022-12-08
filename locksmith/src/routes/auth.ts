import express from 'express'

const router = express.Router({ mergeParams: true })
import AuthController from '../controllers/authController'

router.post('/', AuthController.authorize)
module.exports = router
