import React from 'react'
import { RawLock } from '../../../unlockTypes'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import { usePurchaseKey } from '../../../hooks/usePurchaseKey'
import * as LockVariations from './LockVariations'

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

interface LockTickerSymbolLock {
  currencyContractAddress: string | null
  currencySymbol?: string
}

export const lockTickerSymbol = (lock: LockTickerSymbolLock) => {
  if (lock.currencyContractAddress) {
    // TODO: if there is no symbol, we probably need something better than "ERC20"
    return (lock as any).currencySymbol || 'ERC20'
  }
  return 'ETH'
}

export const Lock = ({
  lock,
  purchasingLockAddress,
  setPurchasingLockAddress,
}: LockProps) => {
  const { purchaseKey, transactionHash } = usePurchaseKey(lock)

  const onClick = () => {
    if (purchasingLockAddress) {
      // There is already a key purchase in progress (or completed) -- do not start another one
      return
    }

    setPurchasingLockAddress(lock.address)
    purchaseKey()
  }

  const props: LockVariations.LockProps = {
    onClick,
    formattedDuration: durationsAsTextFromSeconds(lock.expirationDuration),
    formattedKeyPrice: `${lock.keyPrice} ${lockTickerSymbol(lock)}`,
    formattedKeysAvailable: lockKeysAvailable(lock),
    name: lock.name,
  }

  // This lock is being/has been purchased
  if (purchasingLockAddress === lock.address) {
    if (transactionHash) {
      return <LockVariations.ConfirmedLock {...props} />
    }
    return <LockVariations.ProcessingLock {...props} />
  }

  // Some other lock is being/has been purchased
  if (purchasingLockAddress) {
    return <LockVariations.DisabledLock {...props} />
  }

  // No lock is being/has been purchased
  return <LockVariations.PurchaseableLock {...props} />
}
