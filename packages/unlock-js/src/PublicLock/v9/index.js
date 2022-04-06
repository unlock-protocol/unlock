import abis from '../../abis'
import purchaseKey from './purchaseKey'
import setMaxNumberOfKeys from './setMaxNumberOfKeys'
import setExpirationDuration from './setExpirationDuration'

import v8 from '../v8'

const {
  grantKey,
  updateKeyPrice,
  withdrawFromLock,
  initializeTemplate,
  isLockManager,
  isKeyGranter,
  addKeyGranter,
  expireAndRefundFor,
  cancelAndRefund,
  shareKey,
  getLock,
  keyManagerOf,
  getCancelAndRefundValueFor,
} = v8

export default {
  version: 'v9',
  Unlock: abis.Unlock.v9,
  PublicLock: abis.PublicLock.v9,
  grantKey,
  updateKeyPrice,
  withdrawFromLock,
  initializeTemplate,
  isLockManager,
  isKeyGranter,
  addKeyGranter,
  expireAndRefundFor,
  cancelAndRefund,
  shareKey,
  getLock,
  purchaseKey,
  keyManagerOf,
  setMaxNumberOfKeys,
  setExpirationDuration,
  getCancelAndRefundValueFor,
}
