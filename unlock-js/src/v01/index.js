import { Unlock, PublicLock } from 'unlock-abi-0-1'
import createLock from './createLock'
import ethers_createLock from './createLock.ethers'
import getLock from './getLock'
import partialWithdrawFromLock from './partialWithdrawFromLock'
import ethers_partialWithdrawFromLock from './partialWithdrawFromLock.ethers'
import purchaseKey from './purchaseKey'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'

export default {
  ethers_createLock,
  createLock,
  getLock,
  partialWithdrawFromLock,
  ethers_partialWithdrawFromLock,
  purchaseKey,
  updateKeyPrice,
  withdrawFromLock,
  version: 'v01',
  Unlock,
  PublicLock,
}
