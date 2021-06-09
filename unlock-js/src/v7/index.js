import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import grantKey from './grantKey'
import configureUnlock from './configureUnlock'
import isLockManager from './isLockManager'
import isKeyGranter from './isKeyGranter'
import addKeyGranter from './addKeyGranter'
import expireAndRefundFor from './expireAndRefundFor'
import cancelAndRefund from './cancelAndRefund'
import keyManagerOf from './keyManagerOf'

import v6 from '../v6'

const { shareKey, initializeTemplate, withdrawFromLock, updateKeyPrice } = v6

export default {
  version: 'v7',
  Unlock: abis.v7.Unlock,
  PublicLock: abis.v7.PublicLock,
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
