var express = require('express')

var router = express.Router()
var lockController = require('../controllers/lockController')

router.put('/lock/:lockAddress', lockController.lockUpdate)
router.post('/lock', lockController.lockCreate)
router.get('/lock/:lockAddress', lockController.lockGet)
router.get('/:owner/locks', lockController.lockOwnerGet)

module.exports = router
