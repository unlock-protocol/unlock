import abis from '../../abis'
import purchaseKey from './purchaseKey'
import grantKey from './grantKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import isLockManager from './isLockManager'
import cancelAndRefund from './cancelAndRefund'

export default {
  purchaseKey,
  grantKey,
  updateKeyPrice,
  withdrawFromLock,
  isLockManager,
  version: 'v4',
  Unlock: abis.Unlock.v4,
  PublicLock: abis.PublicLock.v4,
  cancelAndRefund,
}
