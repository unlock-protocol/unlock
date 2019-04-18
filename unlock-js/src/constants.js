export const GAS_AMOUNTS = {
  createLock: 3500000,
  updateKeyPrice: 1000000,
  purchaseKey: 300000,
  withdrawFromLock: 1000000,
  partialWithdrawFromLock: 1000000,
}

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export const UNLIMITED_KEYS_COUNT = -1

export const KEY_ID = (lock, owner) => [lock, owner].join('-')

export default {
  MAX_UINT,
  UNLIMITED_KEYS_COUNT,
  GAS_AMOUNTS,
  KEY_ID,
}
