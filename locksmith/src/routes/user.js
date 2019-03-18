let express = require('express')

let router = express.Router()
/* eslint-disable import/no-unresolved*/
let userController = require('../controllers/userController')

router.post('/', userController.createUser)
router.get('/:emailAddress', userController.retrieveEncryptedPrivatekey)

module.exports = router
