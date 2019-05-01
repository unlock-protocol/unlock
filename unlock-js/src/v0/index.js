import { Unlock, PublicLock } from 'unlock-abi-0'
import createLock from './createLock'
import ethers_createLock from './createLock.ethers'
import getLock from './getLock'
import partialWithdrawFromLock from './partialWithdrawFromLock'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'

export default {
  ethers_createLock,
  createLock,
  getLock,
  partialWithdrawFromLock,
  purchaseKey,
  updateKeyPrice,
  withdrawFromLock,
  version: 'v0',
  Unlock,
  PublicLock,
}
