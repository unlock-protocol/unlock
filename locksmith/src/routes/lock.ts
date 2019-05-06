import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

var router = express.Router()
var lockController = require('../controllers/lockController')

let lockSignatureConfiguration = {
  name: 'lock',
  required: ['name', 'owner', 'address'],
  signee: 'owner',
}

router.post(
  /^\/lock\/?$/i,
  signatureValidationMiddleware.generateProcessor(lockSignatureConfiguration)
)

router.post('/lock', lockController.lockSave)
router.get('/lock/:lockAddress', lockController.lockGet)
router.get('/:owner/locks', lockController.lockOwnerGet)

module.exports = router
