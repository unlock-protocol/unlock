import abis from '../../abis'
import purchaseKey from './purchaseKey'
import purchaseKeys from './purchaseKeys'
import grantKey from './grantKey'
import grantKeys from './grantKeys'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import initializeTemplate from './initializeTemplate'
import isLockManager from './isLockManager'
import cancelAndRefund from './cancelAndRefund'
import shareKey from './shareKey'
import getLock from './getLock'

import v4 from '../v4'

const { getTokenIdForOwner, getKeyExpirationByLockForOwner } = v4

export default {
  version: 'v6',
  Unlock: abis.Unlock.v6,
  PublicLock: abis.PublicLock.v6,
  initializeTemplate,
  updateKeyPrice,
  purchaseKey,
  purchaseKeys,
  getLock,
  grantKey,
  grantKeys,
  withdrawFromLock,
  isLockManager,
  cancelAndRefund,
  shareKey,
  getTokenIdForOwner,
  getKeyExpirationByLockForOwner,
}
