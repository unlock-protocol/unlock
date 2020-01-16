import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'

export default {
  version: 'v13',
  Unlock: abis.v13.Unlock,
  PublicLock: abis.v13.PublicLock,
  createLock,
  getLock,
  updateKeyPrice,
  purchaseKey,
  withdrawFromLock,
}
