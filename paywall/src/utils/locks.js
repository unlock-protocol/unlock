/**
 * Yields the currency name for a lock
 */
export function currencySymbolForLock(lock, config) {
  let currency = 'Eth'
  if (lock.currencySymbol) {
    return lock.currencySymbol
  }
  // TODO: remove me, as we now get the currency symbol from the contract
  if (lock.currencyContractAddress === config.erc20Contract.address) {
    currency = config.erc20Contract.name
  } else if (lock.currencyContractAddress) {
    currency = 'ERC20' // Default
  }
  return currency
}

/**
 * Returns true if the lock is too expensive for user in its currency
 * @param {*} lock
 * @param {*} account
 */
export function isTooExpensiveForUser(lock, account) {
  let tooExpensive = false
  if (account && account.balance) {
    // eth lock
    if (
      !lock.currencyContractAddress &&
      account.balance.eth &&
      parseFloat(account.balance.eth) <= parseFloat(lock.keyPrice)
    ) {
      tooExpensive = true
    } else if (
      // erc20 lock
      lock.currencyContractAddress &&
      account.balance[lock.currencyContractAddress] &&
      parseFloat(account.balance[lock.currencyContractAddress]) <=
        parseFloat(lock.keyPrice)
    ) {
      tooExpensive = true
    }
  }
  return tooExpensive
}

export default {
  currencySymbolForLock,
  isTooExpensiveForUser,
}
