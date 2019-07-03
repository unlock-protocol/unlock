import express from 'express'

var router = express.Router()
var lockController = require('../controllers/lockController')

router.post('/lock', lockController.lockSave)
router.get('/lock/:lockAddress', lockController.lockGet)
router.get('/:owner/locks', lockController.lockOwnerGet)

module.exports = router
