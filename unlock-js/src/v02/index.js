import { Unlock, PublicLock } from 'unlock-abi-0-2'
import createLock from './createLock'
import ethers_createLock from './createLock.ethers'
import getLock from './getLock'
import ethers_getLock from './getLock.ethers'
import partialWithdrawFromLock from './partialWithdrawFromLock'
import ethers_partialWithdrawFromLock from './partialWithdrawFromLock.ethers'
import purchaseKey from './purchaseKey'
import ethers_purchaseKey from './purchaseKey.ethers'
import updateKeyPrice from './updateKeyPrice'
import ethers_updateKeyPrice from './updateKeyPrice.ethers'
import withdrawFromLock from './withdrawFromLock'

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
  ethers_updateKeyPrice,
  withdrawFromLock,
  version: 'v02',
  Unlock,
  PublicLock,
}
