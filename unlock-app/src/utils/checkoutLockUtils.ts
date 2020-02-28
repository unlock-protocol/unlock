import { Balances } from '../unlockTypes'

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
  currencyContractAddress?: string
  keyPrice: string
}

export const lockKeysAvailable = ({
  unlimitedKeys,
  maxNumberOfKeys,
  outstandingKeys,
}: LockKeysAvailableLock) => {
  if (unlimitedKeys) {
    return 'Unlimited'
  }

  // maxNumberOfKeys and outstandingKeys are assumed to be defined
  // if they are ever not, a runtime error can occur
  return (maxNumberOfKeys! - outstandingKeys!).toLocaleString()
}

export const lockTickerSymbol = (lock: LockTickerSymbolLock) => {
  if (lock.currencyContractAddress) {
    // TODO: if there is no symbol, we probably need something better than "ERC20"
    return (lock as any).currencySymbol || 'ERC20'
  }
  return 'ETH'
}

export const userCanAffordKey = (
  lock: LockPriceLock,
  balances: Balances
): boolean => {
  const currency = lock.currencyContractAddress || 'eth'
  const keyPrice = parseFloat(lock.keyPrice)
  const balance = parseFloat(balances[currency])

  if (typeof keyPrice !== 'number' || typeof balance !== 'number') {
    // we could not parse one of these numbers, ipso facto we cannot afford a key
    return false
  }

  return keyPrice <= balance
}
