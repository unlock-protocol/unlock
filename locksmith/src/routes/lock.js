var express = require('express')

var router = express.Router()
var lock_controller = require('../controllers/lockController')

router.put('/lock/:lockAddress', lock_controller.lock_update)
router.post('/lock', lock_controller.lock_create)
router.get('/lock/:lockAddress', lock_controller.lock_get)
router.get('/:owner/locks', lock_controller.lock_owner_get)

module.exports = router
