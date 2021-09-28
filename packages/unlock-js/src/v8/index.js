import abis from '../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'
import keyManagerOf from './keyManagerOf'
import purchaseKey from './purchaseKey'

import v7 from '../v7'

const {
  getLock,
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
} = v7

export default {
  version: 'v8',
  Unlock: abis.v8.Unlock,
  PublicLock: abis.v8.PublicLock,
  createLock,
  getLock,
  initializeTemplate,
  updateKeyPrice,
  purchaseKey,
  grantKey,
  withdrawFromLock,
  configureUnlock,
  isLockManager,
  isKeyGranter,
  addKeyGranter,
  expireAndRefundFor,
  cancelAndRefund,
  shareKey,
  keyManagerOf,
}
