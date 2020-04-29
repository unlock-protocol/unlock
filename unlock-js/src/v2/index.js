import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import grantKey from './grantKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import configureUnlock from './configureUnlock'
import isLockManager from './isLockManager'

export default {
  createLock,
  configureUnlock,
  getLock,
  purchaseKey,
  grantKey,
  updateKeyPrice,
  withdrawFromLock,
  isLockManager,
  version: 'v2',
  Unlock: abis.v2.Unlock,
  PublicLock: abis.v2.PublicLock,
}
