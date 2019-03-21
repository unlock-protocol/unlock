let express = require('express')

let router = express.Router()
let userController = require('../controllers/userController')

router.post('/', userController.createUser)
router.get(
  '/:emailAddress/privatekey',
  userController.retrieveEncryptedPrivatekey
)

module.exports = router
