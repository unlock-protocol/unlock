let express = require('express')

let router = express.Router()
let userController = require('../controllers/userController')

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

module.exports = router
