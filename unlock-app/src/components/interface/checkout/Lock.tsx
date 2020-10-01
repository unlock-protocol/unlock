import React from 'react'
import { KeyResult } from '@unlock-protocol/unlock-js'
import { RawLock, Balances } from '../../../unlockTypes'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import {
  lockKeysAvailable,
  numberOfAvailableKeys,
  lockTickerSymbol,
  userCanAffordKey,
} from '../../../utils/checkoutLockUtils'
import { usePurchaseKey } from '../../../hooks/usePurchaseKey'
import * as LockVariations from './LockVariations'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { useCheckoutStore } from '../../../hooks/useCheckoutStore'
import {
  setPurchasingLockAddress,
  setDelayedPurchase,
} from '../../../utils/checkoutActions'

interface LockProps {
  lock: RawLock
  emitTransactionInfo: (info: TransactionInfo) => void
  balances: Balances
  activeKeys: KeyResult[]
  accountAddress: string
  metadataRequired?: boolean
  showMetadataForm: () => void
}

export const Lock = ({
  lock,
  emitTransactionInfo,
  balances,
  activeKeys,
  accountAddress,
  metadataRequired,
  showMetadataForm,
}: LockProps) => {
  const { purchaseKey } = usePurchaseKey(emitTransactionInfo)
  const { state, dispatch } = useCheckoutStore()

  const purchase = () => {
    dispatch(setPurchasingLockAddress(lock.address))
    purchaseKey(lock, accountAddress)
  }

  const onClick = () => {
    if (state.purchasingLockAddress) {
      // There is already a key purchase in progress (or completed) -- do not start another one
      return
    }

    if (metadataRequired) {
      dispatch(
        setDelayedPurchase({
          lockAddress: lock.address,
          purchaseKey: purchase,
        })
      )
      showMetadataForm()
    } else {
      purchase()
    }
  }

  const props: LockVariations.LockProps = {
    onClick,
    formattedDuration: durationsAsTextFromSeconds(lock.expirationDuration),
    formattedKeyPrice: `${lock.keyPrice} ${lockTickerSymbol(lock)}`,
    formattedKeysAvailable: lockKeysAvailable(lock),
    name: lock.name,
    address: lock.address,
  }

  const canAfford = userCanAffordKey(lock, balances)

  const keyForThisLock = activeKeys.find((key) => key.lock === lock.address)

  const isSoldOut = numberOfAvailableKeys(lock) === 0

  // Lock is sold out
  if (isSoldOut) {
    return <LockVariations.SoldOutLock {...props} />
  }

  // This lock is being/has been purchased
  if (state.purchasingLockAddress === lock.address || keyForThisLock) {
    if (state.transactionHash || keyForThisLock) {
      return <LockVariations.ConfirmedLock {...props} />
    }
    return <LockVariations.ProcessingLock {...props} />
  }

  // Some other lock is being/has been purchased
  if (state.purchasingLockAddress || activeKeys.length) {
    return <LockVariations.DisabledLock {...props} />
  }

  // No lock is being/has been purchased
  if (canAfford) {
    return <LockVariations.PurchaseableLock {...props} />
  }

  return <LockVariations.InsufficientBalanceLock {...props} />
}

Lock.defaultProps = {
  metadataRequired: false,
}
