import React from 'react'
import { RawLock } from '../../../unlockTypes'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import { usePurchaseKey } from '../../../hooks/usePurchaseKey'
import { PurchaseableLock } from './LockVariations'

interface LockProps {
  lock: RawLock
  purchasingLockAddress: string | null
  setPurchasingLockAddress: (lockAddress: string) => void
}

interface LockKeysAvailableLock {
  unlimitedKeys?: boolean
  maxNumberOfKeys?: number
  outstandingKeys?: number
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

export const lockTickerSymbol = (lock: RawLock) => {
  return (lock as any).currencySymbol || 'ETH'
}

export const Lock = ({
  lock,
  purchasingLockAddress,
  setPurchasingLockAddress,
}: LockProps) => {
  const { purchaseKey } = usePurchaseKey(lock)

  const onClick = () => {
    if (purchasingLockAddress) {
      // There is already a key purchase in progress (or completed) -- do not start another one
      return
    }

    setPurchasingLockAddress(lock.address)
    purchaseKey()
  }

  return (
    <PurchaseableLock
      name={lock.name}
      formattedDuration={durationsAsTextFromSeconds(lock.expirationDuration)}
      formattedKeyPrice={`${lock.keyPrice} ${lockTickerSymbol(lock)}`}
      formattedKeysAvailable={lockKeysAvailable(lock)}
      onClick={onClick}
    />
  )
}
