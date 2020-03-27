import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import configureUnlock from './configureUnlock'
import isLockManager from './isLockManager'

export default {
  version: 'v12',
  Unlock: abis.v12.Unlock,
  PublicLock: abis.v12.PublicLock,
  createLock,
  getLock,
  updateKeyPrice,
  purchaseKey,
  withdrawFromLock,
  configureUnlock,
  isLockManager,
}
