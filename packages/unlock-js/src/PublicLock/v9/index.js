import abis from '../../abis'
import purchaseKey from './purchaseKey'
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
} = v8

export default {
  version: 'v8',
  Unlock: abis.Unlock.v8,
  PublicLock: abis.PublicLock.v8,
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
}
