import React, { useEffect } from 'react'
import { KeyResult } from '@unlock-protocol/unlock-js'
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
import { useCheckoutStore } from '../../../hooks/useCheckoutStore'
import {
  setPurchasingLockAddress,
  setDelayedPurchase,
  setShowingMetadataForm,
} from '../../../utils/checkoutActions'

interface LockProps {
  lock: RawLock
  emitTransactionInfo: (info: TransactionInfo) => void
  balances: Balances
  activeKeys: KeyResult[]
  accountAddress: string
  metadataRequired: boolean
}

export const Lock = ({
  lock,
  emitTransactionInfo,
  balances,
  activeKeys,
  accountAddress,
  metadataRequired,
}: LockProps) => {
  const { purchaseKey, transactionHash } = usePurchaseKey(lock, accountAddress)
  const { state, dispatch } = useCheckoutStore()

  const purchase = () => {
    dispatch(setPurchasingLockAddress(lock.address))
    purchaseKey()
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
      dispatch(setShowingMetadataForm(true))
    } else {
      purchase()
    }
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

  const keyForThisLock = activeKeys.find(key => key.lock === lock.address)

  // This lock is being/has been purchased
  if (state.purchasingLockAddress === lock.address || keyForThisLock) {
    if (transactionHash || keyForThisLock) {
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
