import { Unlock, PublicLock } from 'unlock-abi-0'
import ethers_createLock from './createLock.ethers'
import ethers_getLock from './getLock.ethers'
import ethers_partialWithdrawFromLock from './partialWithdrawFromLock.ethers'
import ethers_purchaseKey from './purchaseKey.ethers'
import ethers_updateKeyPrice from './updateKeyPrice.ethers'
import ethers_withdrawFromLock from './withdrawFromLock.ethers'

export default {
  ethers_createLock,
  ethers_getLock,
  ethers_partialWithdrawFromLock,
  ethers_purchaseKey,
  ethers_updateKeyPrice,
  ethers_withdrawFromLock,
  version: 'v0',
  Unlock,
  PublicLock,
}
