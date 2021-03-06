/**
 * Given a lock, returns its symbol's currency
 * @param {*} lock
 * @param {*} config
 */
export const currencySymbol = (lock, defaultERC20) => {
  let currency = ''
  if (lock.currencySymbol) {
    currency = lock.currencySymbol
  } else if (lock.currencyContractAddress) {
    currency = 'ERC20' // Default for ERC20 without symbol
  }
  return currency
}

export default {
  currencySymbol,
}
