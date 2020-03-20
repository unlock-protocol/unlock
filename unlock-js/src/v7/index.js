import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import initializeTemplate from './initializeTemplate'
import configureUnlock from './configureUnlock'

export default {
  version: 'v7',
  Unlock: abis.v7.Unlock,
  PublicLock: abis.v7.PublicLock,
  createLock,
  getLock,
  initializeTemplate,
  updateKeyPrice,
  purchaseKey,
  withdrawFromLock,
  configureUnlock,
}
