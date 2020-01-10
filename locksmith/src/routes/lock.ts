import express from 'express'

const router = express.Router()
const lockController = require('../controllers/lockController')

router.post('/lock', lockController.lockSave)
router.get('/lock/:lockAddress', lockController.lockGet)
router.get('/lock/:lockAddress/cycle', lockController.lockOwnershipCheck)
router.get('/lock/:lockAddress/icon', lockController.lockIcon)
router.get('/:owner/locks', lockController.lockOwnerGet)

module.exports = router
