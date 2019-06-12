/**
 * Yields the currency name for a lock
 */
export function currencySymbolForLock(lock, config) {
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
