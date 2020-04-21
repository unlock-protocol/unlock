import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import grantKey from './grantKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import configureUnlock from './configureUnlock'
import isLockManager from './isLockManager'

const version = 'v0'
const { Unlock } = abis.v0
const { PublicLock } = abis.v0
export default {
  createLock,
  configureUnlock,
  isLockManager,
  getLock,
  purchaseKey,
  grantKey,
  updateKeyPrice,
  withdrawFromLock,
  version,
  Unlock,
  PublicLock,
}
