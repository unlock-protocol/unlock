import { ZeroAddress } from 'ethers'

interface RecurringRenewalLock {
  currencyContractAddress?: string | null
  expirationDuration?: number | string | null
  keyPrice?: number | string | null
  price?: number | string | null
  publicLockVersion?: number | string | null
  tokenAddress?: string | null
  version?: number | string | null
}

const MAX_RENEWABLE_DURATION_SECONDS = 60 * 60 * 24 * 365 * 100

export const isRecurringRenewalLock = (lock?: RecurringRenewalLock | null) => {
  if (!lock) {
    return false
  }

  const lockPrice = lock.keyPrice ?? lock.price
  const currencyAddress = lock.currencyContractAddress ?? lock.tokenAddress
  const lockVersion = lock.publicLockVersion ?? lock.version
  const expirationDuration = Number(lock.expirationDuration)

  return (
    Number(lockPrice) > 0 &&
    !!currencyAddress &&
    currencyAddress !== ZeroAddress &&
    Number(lockVersion) >= 11 &&
    expirationDuration !== -1 &&
    expirationDuration < MAX_RENEWABLE_DURATION_SECONDS
  )
}
