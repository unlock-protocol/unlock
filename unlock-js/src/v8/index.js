import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import grantKey from './grantKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import initializeTemplate from './initializeTemplate'
import configureUnlock from './configureUnlock'
import isLockManager from './isLockManager'

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
}
