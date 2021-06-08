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
import shareKey from './shareKey'

import v4 from '../v4'

const { cancelAndRefund } = v4

export default {
  version: 'v6',
  Unlock: abis.v6.Unlock,
  PublicLock: abis.v6.PublicLock,
  createLock,
  getLock,
  initializeTemplate,
  updateKeyPrice,
  purchaseKey,
  grantKey,
  withdrawFromLock,
  configureUnlock,
  isLockManager,
  cancelAndRefund,
  shareKey,
}
