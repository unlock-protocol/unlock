import { ethers } from 'ethers'

export const GAS_AMOUNTS = {
  createLock: 4500000,
  updateKeyPrice: 100000,
  purchaseFor: 300000, // purchaseKey in walletService
  withdraw: 100000, // withdrawFromLock in walletService
  partialWithdraw: 100000, // partialWithdrawFromLock in walletService
  deployContract: 6400000,
}

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'
export const ETHERS_MAX_UINT = ethers.constants.MaxUint256

export const UNLIMITED_KEYS_COUNT = -1

export const KEY_ID = (lock, owner) => [lock, owner].join('-')

export default {
  MAX_UINT,
  UNLIMITED_KEYS_COUNT,
  GAS_AMOUNTS,
  KEY_ID,
}

// See
// https://docs.ethers.io/ethers.js/html/api-wallet.html#encrypted-json-wallets
// for available params; right now a custom value of scrypt/N covers our needs.
export const walletEncryptionOptions = {
  scrypt: {
    // web3 used 1 << 13, ethers default is 1 << 18 so this is a nice middle ground
    N: 1 << 16,
  },
}

export const ZERO = ethers.constants.AddressZero
