import abis from '../../abis'
import purchaseKey from './purchaseKey'
import grantKey from './grantKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import initializeTemplate from './initializeTemplate'
import isLockManager from './isLockManager'
import cancelAndRefund from './cancelAndRefund'
import shareKey from './shareKey'

export default {
  version: 'v6',
  Unlock: abis.v6.Unlock,
  PublicLock: abis.v6.PublicLock,
  initializeTemplate,
  updateKeyPrice,
  purchaseKey,
  grantKey,
  withdrawFromLock,
  isLockManager,
  cancelAndRefund,
  shareKey,
}
