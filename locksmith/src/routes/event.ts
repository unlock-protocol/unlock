import express from 'express'

let router = express.Router()
let eventController = require('../controllers/eventController')

router.post('/', eventController.create)
router.get('/:lockAddress', eventController.find)

module.exports = router
