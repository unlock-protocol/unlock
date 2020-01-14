import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router()
const eventController = require('../controllers/eventController')

const eventConfiguration = {
  name: 'event',
  required: ['lockAddress', 'name', 'location', 'date', 'owner'],
  signee: 'owner',
}

const eventModificationConfiguration = {
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
