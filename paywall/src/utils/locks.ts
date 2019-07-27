import { Lock, UnlockConfig } from '../unlockTypes'

/**
 * Yields the currency name for a lock
 */
export function currencySymbolForLock(lock: Lock, config: UnlockConfig) {
  let currency = 'Eth'
  if (lock.currencyContractAddress === config.erc20Contract.address) {
    currency = config.erc20Contract.name
  } else if (lock.currencyContractAddress) {
    currency = 'ERC20' // Default
  }
  return currency
}

export default {
  currencySymbolForLock,
}
