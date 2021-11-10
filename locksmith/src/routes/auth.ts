import express from 'express'

const router = express.Router({ mergeParams: true })
const authController = require('../controllers/authController')

router.post('/', authController.authorize)
module.exports = router
