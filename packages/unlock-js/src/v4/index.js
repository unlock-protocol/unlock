import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import grantKey from './grantKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import configureUnlock from './configureUnlock'
import isLockManager from './isLockManager'
import cancelAndRefund from './cancelAndRefund'

export default {
  createLock,
  configureUnlock,
  getLock,
  purchaseKey,
  grantKey,
  updateKeyPrice,
  withdrawFromLock,
  isLockManager,
  version: 'v4',
  Unlock: abis.v4.Unlock,
  PublicLock: abis.v4.PublicLock,
  cancelAndRefund,
}
