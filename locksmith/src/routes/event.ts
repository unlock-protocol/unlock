import express from 'express'

let router = express.Router()
let eventController = require('../controllers/eventController')

router.post('/', eventController.create)
router.post('/:lockAddress/links', eventController.addLinks)
router.get('/:lockAddress', eventController.find)
router.put('/:lockAddress', eventController.save)

module.exports = router
