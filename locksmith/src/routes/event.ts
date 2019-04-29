import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

let router = express.Router()
let eventController = require('../controllers/eventController')

let eventConfiguration = {
  name: 'event',
  required: ['lockAddress', 'name', 'location', 'date', 'owner'],
  signee: 'owner',
}

let eventModificationConfiguration = {
  name: 'eventModification',
  required: ['lockAddress', 'owner'],
  signee: 'owner',
}

router.post(
  '/',
  signatureValidationMiddleware.generateProcessor(eventConfiguration)
)

router.post(
  /^\/\S+\/links\/?$/i,
  signatureValidationMiddleware.generateProcessor(
    eventModificationConfiguration
  )
)

router.put(
  /^\/\S+\/?$/i,
  signatureValidationMiddleware.generateProcessor(eventConfiguration)
)

router.get('/:lockAddress', eventController.find)
router.post('/', eventController.create)
router.post('/:lockAddress/links', eventController.addLinks)
router.put('/:lockAddress', eventController.save)

module.exports = router
