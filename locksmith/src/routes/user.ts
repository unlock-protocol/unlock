import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router()
const userController = require('../controllers/userController')

const passwordEncryptedPrivateKeyPathRegex = new RegExp(
  '^/users/S+/passwordEncryptedPrivateKey/?$',
  'i'
)
const userUpdatePathRegex = new RegExp('^/users/?$', 'i')
const ejectionPathRegex = '/:ethereumAddress/eject'

router.post(
  ejectionPathRegex,
  signatureValidationMiddleware.generateProcessor({
    name: 'user',
    required: ['publicKey'],
    signee: 'publicKey',
  })
)

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
router.post('/:ethereumAddress/eject', userController.eject)

module.exports = router
