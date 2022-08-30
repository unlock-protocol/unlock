import abis from '../../abis'
import keyManagerOf from './keyManagerOf'
import approveBeneficiary from './approveBeneficiary'

import v7 from '../v7'

const {
  grantKey,
  grantKeys,
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
  getTokenIdForOwner,
  getKeyExpirationByLockForOwner,
  totalKeys,
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
  grantKeys,
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
  getTokenIdForOwner,
  getKeyExpirationByLockForOwner,
  approveBeneficiary,
  totalKeys,
}
