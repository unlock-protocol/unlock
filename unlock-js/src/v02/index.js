import { Unlock, PublicLock } from 'unlock-abi-0-2'
import createLock from './createLock'
import ethers_createLock from './createLock.ethers'
import getLock from './getLock'
import ethers_getLock from './getLock.ethers'
import partialWithdrawFromLock from './partialWithdrawFromLock'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'

export default {
  ethers_createLock,
  createLock,
  getLock,
  ethers_getLock,
  partialWithdrawFromLock,
  purchaseKey,
  updateKeyPrice,
  withdrawFromLock,
  version: 'v02',
  Unlock,
  PublicLock,
}
