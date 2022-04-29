import abis from '../../abis'
import purchaseKey from './purchaseKey'
import purchaseKeys from './purchaseKeys'
import grantKey from './grantKey'
import grantKeys from './grantKeys'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import isLockManager from './isLockManager'
import cancelAndRefund from './cancelAndRefund'
import getLock from './getLock'
import getTokenIdForOwner from './getTokenIdForOwner'
import getKeyExpirationByLockForOwner from './getKeyExpirationByLockForOwner'

export default {
  purchaseKey,
  purchaseKeys,
  grantKey,
  grantKeys,
  updateKeyPrice,
  getLock,
  withdrawFromLock,
  isLockManager,
  version: 'v4',
  Unlock: abis.Unlock.v4,
  PublicLock: abis.PublicLock.v4,
  cancelAndRefund,
  getTokenIdForOwner,
  getKeyExpirationByLockForOwner,
}
