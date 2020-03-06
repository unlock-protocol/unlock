import React, { useEffect } from 'react'
import { RawLock, Balances } from '../../../unlockTypes'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import {
  lockKeysAvailable,
  lockTickerSymbol,
  userCanAffordKey,
} from '../../../utils/checkoutLockUtils'
import { usePurchaseKey } from '../../../hooks/usePurchaseKey'
import * as LockVariations from './LockVariations'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'

interface LockProps {
  lock: RawLock
  purchasingLockAddress: string | null
  setPurchasingLockAddress: (lockAddress: string) => void
  emitTransactionInfo: (info: TransactionInfo) => void
  balances: Balances
}

export const Lock = ({
  lock,
  purchasingLockAddress,
  setPurchasingLockAddress,
  emitTransactionInfo,
  balances,
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

  useEffect(() => {
    if (transactionHash) {
      emitTransactionInfo({
        hash: transactionHash,
      })
    }
  }, [transactionHash])

  const props: LockVariations.LockProps = {
    onClick,
    formattedDuration: durationsAsTextFromSeconds(lock.expirationDuration),
    formattedKeyPrice: `${lock.keyPrice} ${lockTickerSymbol(lock)}`,
    formattedKeysAvailable: lockKeysAvailable(lock),
    name: lock.name,
  }

  const canAfford = userCanAffordKey(lock, balances)

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
  if (canAfford) {
    return <LockVariations.PurchaseableLock {...props} />
  }

  return <LockVariations.InsufficientBalanceLock {...props} />
}
