import { ethers } from 'ethers'

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export const ETHERS_MAX_UINT = BigInt(ethers.MaxUint256)

export const UNLIMITED_KEYS_COUNT = -1

export const ZERO = ethers.ZeroAddress

export const DEFAULT_TOKEN_DECIMALS = 18

export default {
  MAX_UINT,
  UNLIMITED_KEYS_COUNT,
}
