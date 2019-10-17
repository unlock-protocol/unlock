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
 * Returns true if the keys for `lock` are priced in ERC20, false otherwise.
 * @param {*} lock
 */
export const isERC20Lock = lock => {
  return !!lock.currencyContractAddress
}

/**
 * Returns true if the keys for `lock` are priced in Eth, false otherwise.
 * @param {*} lock
 */
export const isEthLock = lock => {
  return !lock.currencyContractAddress
}

// Just setting up named constants here so the code is more easily read, these
// shouldn't be used outside of this file.
const LOCK_IS_TOO_EXPENSIVE = true
const LOCK_IS_AFFORDABLE = false

/**
 * Returns true if the lock is too expensive for user in a given currency
 * @param {*} lock
 * @param {*} account
 * @param {string} currencyKey
 * @returns {boolean}
 */
export function isTooExpensiveForUserByCurrency(lock, account, currencyKey) {
  // Not having an account or an account balance should be treated like having 0
  // of whatever currency.
  if (!account || !account.balance) {
    return LOCK_IS_TOO_EXPENSIVE
  }
  const balance = parseFloat(account.balance[currencyKey])
  if (!balance) {
    return LOCK_IS_TOO_EXPENSIVE
  }

  const keyPrice = parseFloat(lock.keyPrice)
  if (typeof keyPrice !== 'number') {
    // All locks should have a keyPrice, but if for some reason one doesn't,
    // we're in some kind of broken state and we'd better prevent purchasing.
    // On locks with no keyPrice the float would be Nan
    return LOCK_IS_TOO_EXPENSIVE
  }

  if (keyPrice <= balance) {
    // This doesn't take gas into account. If a user has exactly as much eth as
    // the price of a key, the wallet will warn that it cannot do the
    // transaction without a little extra for gas. For an ERC20-priced lock, it
    // makes sense to be able to spend all of your token on one thing.
    return LOCK_IS_AFFORDABLE
  }

  return LOCK_IS_TOO_EXPENSIVE
}

/**
 * Returns true if the lock is too expensive for user in its currency
 * @param {*} lock
 * @param {*} account
 */
export function isTooExpensiveForUser(lock, account) {
  if (isEthLock(lock)) {
    return isTooExpensiveForUserByCurrency(lock, account, 'eth')
  } else {
    return isTooExpensiveForUserByCurrency(
      lock,
      account,
      lock.currencyContractAddress
    )
  }
}

export default {
  currencySymbolForLock,
  isTooExpensiveForUser,
}
