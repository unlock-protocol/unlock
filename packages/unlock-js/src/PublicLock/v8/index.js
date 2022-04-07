import abis from '../../abis'
import keyManagerOf from './keyManagerOf'

import v7 from '../v7'

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
  purchaseKey,
  purchaseKeys,
  getCancelAndRefundValueFor,
} = v7

export default {
  version: 'v8',
  Unlock: abis.Unlock.v8,
  PublicLock: abis.PublicLock.v8,
  initializeTemplate,
  updateKeyPrice,
  purchaseKey,
  purchaseKeys,
  grantKey,
  getLock,
  withdrawFromLock,
  isLockManager,
  isKeyGranter,
  addKeyGranter,
  expireAndRefundFor,
  cancelAndRefund,
  shareKey,
  keyManagerOf,
  getCancelAndRefundValueFor,
}
