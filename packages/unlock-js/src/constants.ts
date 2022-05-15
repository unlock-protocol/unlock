import { ethers } from 'ethers'

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export const ETHERS_MAX_UINT = ethers.constants.MaxUint256

export const UNLIMITED_KEYS_COUNT = -1

export const KEY_ID = (lock: string, owner: string) => [lock, owner].join('-')

export const ZERO = ethers.constants.AddressZero

export default {
  MAX_UINT,
  UNLIMITED_KEYS_COUNT,
  KEY_ID,
}
