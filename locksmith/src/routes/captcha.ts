import express from 'express'

const router = express.Router({ mergeParams: true })
const captchaController = require('../controllers/captchaController')

router.get('/', captchaController.sign)
module.exports = router
