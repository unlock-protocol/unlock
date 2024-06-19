import express from 'express'
import { generateGoogleWalletPass } from '../../controllers/v2/passController'
const router = express.Router({ mergeParams: true })

// android pass generation route
router.get('/:network/:lockAddress/:keyId/android', generateGoogleWalletPass)

export default router
