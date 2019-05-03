import { Unlock, PublicLock } from 'unlock-abi-0'
import createLock from './createLock'
import ethers_createLock from './createLock.ethers'
import getLock from './getLock'
import ethers_getLock from './getLock.ethers'
import partialWithdrawFromLock from './partialWithdrawFromLock'
import ethers_partialWithdrawFromLock from './partialWithdrawFromLock.ethers'
import purchaseKey from './purchaseKey'
import ethers_purchaseKey from './purchaseKey.ethers'
import updateKeyPrice from './updateKeyPrice'
import withdrawFromLock from './withdrawFromLock'
import ethers_withdrawFromLock from './withdrawFromLock.ethers'

export default {
  ethers_createLock,
  createLock,
  getLock,
  ethers_getLock,
  partialWithdrawFromLock,
  ethers_partialWithdrawFromLock,
  purchaseKey,
  ethers_purchaseKey,
  updateKeyPrice,
  withdrawFromLock,
  ethers_withdrawFromLock,
  version: 'v0',
  Unlock,
  PublicLock,
}
