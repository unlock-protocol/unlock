import { ethers } from 'ethers'

// TODO: gas amounts should be custom per version!
export const GAS_AMOUNTS = {
  createLock: 4500000,
  updateKeyPrice: 100000,
  purchaseFor: 6000000, // purchaseKey in walletService
  purchase: 6000000, // purchaseKey in walletService
  withdraw: 100000, // withdrawFromLock in walletService
  deployContract: 6400000,
  updateKeyPricing: 100000,
}

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'
export const ETHERS_MAX_UINT = ethers.constants.MaxUint256

export const UNLIMITED_KEYS_COUNT = -1

export const KEY_ID = (lock, owner) => [lock, owner].join('-')

export const ZERO = ethers.constants.AddressZero

export default {
  MAX_UINT,
  UNLIMITED_KEYS_COUNT,
  GAS_AMOUNTS,
  KEY_ID,
}
