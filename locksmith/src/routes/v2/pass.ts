import express from 'express'
import {
  generateAppleWalletPass,
  generateGoogleWalletPass,
} from '../../controllers/v2/passController'
const router: express.Router = express.Router({ mergeParams: true })

// android pass generation route
router.get('/:network/:lockAddress/:keyId/android', generateGoogleWalletPass)

// ios pass generation route
router.get('/:network/:lockAddress/:keyId/ios', generateAppleWalletPass)

export default router
