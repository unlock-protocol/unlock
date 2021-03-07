// These interfaces patch over the sort of incomplete definition of
// RawLock in unlockTypes. TODO: we should really tighten up our lock
// type so that it at least includes as optional all possible
// properties on a lock. These are all compatible with RawLock insofar
// as they only extend it with properties that may be undefined.
interface LockKeysAvailableLock {
  unlimitedKeys?: boolean
  maxNumberOfKeys?: number
  outstandingKeys?: number
}

interface LockTickerSymbolLock {
  currencyContractAddress: string | null
  currencySymbol?: string
}

interface LockPriceLock {
  currencyContractAddress: string | null
  keyPrice: string
}

export const numberOfAvailableKeys = ({
  unlimitedKeys,
  maxNumberOfKeys,
  outstandingKeys,
}: LockKeysAvailableLock) => {
  if (unlimitedKeys) {
    return Infinity
  }

  // maxNumberOfKeys and outstandingKeys are assumed to be defined
  // if they are ever not, a runtime error can occur
  return maxNumberOfKeys! - outstandingKeys!
}

export const lockKeysAvailable = ({
  maxNumberOfKeys,
  outstandingKeys,
}: LockKeysAvailableLock) => {
  if (maxNumberOfKeys === -1) {
    return 'Unlimited'
  }

  // maxNumberOfKeys and outstandingKeys are assumed to be defined
  // if they are ever not, a runtime error can occur
  return (maxNumberOfKeys! - outstandingKeys!).toLocaleString()
}

export const lockTickerSymbol = (
  lock: LockTickerSymbolLock,
  baseCurrencySymbol: string
) => {
  if (lock.currencyContractAddress) {
    return (lock as any).currencySymbol || 'ERC20'
  }
  return baseCurrencySymbol
}

export const userCanAffordKey = (
  lock: LockPriceLock,
  balance: string
): boolean => {
  const keyPrice = parseFloat(lock.keyPrice)
  const _balance = parseFloat(balance)
  // For eth/base currency need some gas so if the balance is exactly the same as key price this would fail
  if (!lock.currencyContractAddress) {
    return keyPrice < _balance
  }

  // TODO: take balance of eth into account for gas (it's tricky!)
  return keyPrice <= _balance
}
