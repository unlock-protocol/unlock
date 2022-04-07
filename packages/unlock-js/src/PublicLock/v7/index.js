import abis from '../../abis'
import grantKey from './grantKey'
import isLockManager from './isLockManager'
import isKeyGranter from './isKeyGranter'
import addKeyGranter from './addKeyGranter'
import expireAndRefundFor from './expireAndRefundFor'
import cancelAndRefund from './cancelAndRefund'
import keyManagerOf from './keyManagerOf'
import getLock from './getLock'

import v6 from '../v6'

const {
  shareKey,
  initializeTemplate,
  withdrawFromLock,
  updateKeyPrice,
  purchaseKey,
  purchaseKeys
} = v6

export default {
  version: 'v7',
  Unlock: abis.Unlock.v7,
  PublicLock: abis.PublicLock.v7,
  initializeTemplate,
  updateKeyPrice,
  purchaseKey,
  purchaseKeys,
  getLock,
  grantKey,
  withdrawFromLock,
  isLockManager,
  isKeyGranter,
  addKeyGranter,
  expireAndRefundFor,
  cancelAndRefund,
  shareKey,
  keyManagerOf,
}
