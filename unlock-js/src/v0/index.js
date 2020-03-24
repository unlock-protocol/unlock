import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import configureUnlock from './configureUnlock'

const version = 'v0'
const { Unlock } = abis.v0
const { PublicLock } = abis.v0
export default {
  createLock,
  configureUnlock,
  getLock,
  purchaseKey,
  updateKeyPrice,
  withdrawFromLock,
  version,
  Unlock,
  PublicLock,
}
