import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

let router = express.Router()
let userController = require('../controllers/userController')

let passwordEncryptedPrivateKeyPathRegex = new RegExp(
  '^/users/S+/passwordEncryptedPrivateKey/?$',
  'i'
)
let userUpdatePathRegex = new RegExp('^/users/?$', 'i')

router.put(
  userUpdatePathRegex,
  signatureValidationMiddleware.generateProcessor({
    name: 'user',
    required: ['emailAddress', 'publicKey'],
    signee: 'publicKey',
  })
)

router.put(
  passwordEncryptedPrivateKeyPathRegex,
  signatureValidationMiddleware.generateProcessor({
    name: 'user',
    required: ['publicKey', 'passwordEncryptedPrivateKey'],
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

router.get('/:emailAddress/cards', userController.cards)
router.put('/:emailAddress', userController.updateUser)
router.put('/:emailAddress/paymentdetails', userController.updatePaymentDetails)
router.put(
  '/:emailAddress/passwordEncryptedPrivateKey',
  userController.updatePasswordEncryptedPrivateKey
)

module.exports = router
