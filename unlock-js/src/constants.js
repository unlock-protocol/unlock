import { constants } from 'ethers'

export const GAS_AMOUNTS = {
  createLock: 3500000,
  updateKeyPrice: 1000000,
  purchaseFor: 300000, // purchaseKey in walletService
  withdraw: 1000000, // withdrawFromLock in walletService
  partialWithdraw: 1000000, // partialWithdrawFromLock in walletService
  deployContract: 6000000,
}

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'
export const ETHERS_MAX_UINT = constants.MaxUint256

export const UNLIMITED_KEYS_COUNT = -1

export const KEY_ID = (lock, owner) => [lock, owner].join('-')

export default {
  MAX_UINT,
  UNLIMITED_KEYS_COUNT,
  GAS_AMOUNTS,
  KEY_ID,
}

export const ZERO = constants.AddressZero
