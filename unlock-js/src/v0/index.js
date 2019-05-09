import abis from '../abis'
import createLock from './createLock'
import getLock from './getLock'
import partialWithdrawFromLock from './partialWithdrawFromLock'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'

export default {
  createLock,
  getLock,
  partialWithdrawFromLock,
  purchaseKey,
  updateKeyPrice,
  withdrawFromLock,
  version: 'v0',
  Unlock: abis.v0.Unlock,
  PublicLock: abis.v0.PublicLock,
}
