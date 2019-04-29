import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

let router = express.Router()
let userController = require('../controllers/userController')

router.post(
  /^\/users\/?$/i,
  signatureValidationMiddleware.generateProcessor({
    name: 'user',
    required: ['emailAddress', 'publicKey', 'passwordEncryptedPrivateKey'],
    signee: 'publicKey',
  })
)
router.put(
  /^\/users\/?$/i,
  signatureValidationMiddleware.generateProcessor({
    name: 'user',
    required: ['emailAddress', 'publicKey'],
    signee: 'publicKey',
  })
)

router.post('/', userController.createUser)
router.get(
  '/:emailAddress/privatekey',
  userController.retrieveEncryptedPrivatekey
)
router.get(
  '/:emailAddress/recoveryphrase',
  userController.retrieveRecoveryPhrase
)
router.put('/:emailAddress', userController.updateUser)
router.put('/:emailAddress/paymentdetails', userController.updatePaymentDetails)

module.exports = router
