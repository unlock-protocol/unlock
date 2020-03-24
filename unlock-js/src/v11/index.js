import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import configureUnlock from './configureUnlock'

export default {
  createLock,
  configureUnlock,
  getLock,
  purchaseKey,
  updateKeyPrice,
  withdrawFromLock,
  version: 'v11',
  Unlock: abis.v11.Unlock,
  PublicLock: abis.v11.PublicLock,
}
