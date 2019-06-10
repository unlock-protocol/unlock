import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'

export default {
  createLock,
  getLock,
  purchaseKey,
  updateKeyPrice,
  withdrawFromLock,
  version: 'v01',
  Unlock: abis.v01.Unlock,
  PublicLock: abis.v01.PublicLock,
}
