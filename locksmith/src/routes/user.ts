import express from 'express'
import signatureValidationMiddleware from '../middlewares/signatureValidationMiddleware'

const router = express.Router({ mergeParams: true })
const userController = require('../controllers/userController')

const passwordEncryptedPrivateKeyPathRegex = new RegExp(
  '^/users/S+/passwordEncryptedPrivateKey/?$',
  'i'
)
const userUpdatePathRegex = new RegExp('^/users/?$', 'i')
const ejectionPathRegex = '/:ethereumAddress/eject'
const cardsPathRegex = '/:ethereumAddress/credit-cards'

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

router.get(
  cardsPathRegex,
  signatureValidationMiddleware.generateSignatureEvaluator({
    name: 'Get Card',
    required: ['publicKey'],
    signee: 'publicKey',
  })
)

router.delete(
  cardsPathRegex,
  signatureValidationMiddleware.generateSignatureEvaluator({
    name: 'Delete Card',
    required: ['publicKey'],
    signee: 'publicKey',
  })
)

router.put(
  cardsPathRegex,
  signatureValidationMiddleware.generateProcessor({
    name: 'Save Card',
    required: ['publicKey', 'stripeTokenId'],
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

router.get('/:emailAddress', userController.exist)

router.get(cardsPathRegex, userController.getAddressPaymentDetails)
// Deprecated: we are now using ethereumAddress to store credit cards
router.get('/:emailAddress/cards', userController.cards)

router.put('/:emailAddress', userController.updateUser)
router.put(
  '/:emailAddress/passwordEncryptedPrivateKey',
  userController.updatePasswordEncryptedPrivateKey
)
router.post('/:ethereumAddress/eject', userController.eject)
router.put(cardsPathRegex, userController.updateAddressPaymentDetails)
router.delete(
  '/:ethereumAddress/credit-cards',
  userController.deleteAddressPaymentDetails
)
// Deprecated
router.put('/:emailAddress/paymentdetails', userController.updatePaymentDetails)
module.exports = router
