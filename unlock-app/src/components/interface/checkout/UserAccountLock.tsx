import React from 'react'
import { KeyResult } from '@unlock-protocol/unlock-js'
import { RawLock } from '../../../unlockTypes'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import { lockKeysAvailable } from '../../../utils/checkoutLockUtils'
import { usePurchaseKey } from '../../../hooks/usePurchaseKey'
import * as LockVariations from './LockVariations'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { useCheckoutStore } from '../../../hooks/useCheckoutStore'
import {
  setPurchasingLockAddress,
  setDelayedPurchase,
  setShowingMetadataForm,
} from '../../../utils/checkoutActions'

interface UserAccountLockProps {
  lock: RawLock
  formattedKeyPrice: string
  emitTransactionInfo: (info: TransactionInfo) => void
  activeKeys: KeyResult[]
  accountAddress: string
  metadataRequired?: boolean
}

export const UserAccountLock = ({
  lock,
  emitTransactionInfo,
  activeKeys,
  accountAddress,
  metadataRequired,
  formattedKeyPrice,
}: UserAccountLockProps) => {
  // TODO: replace with user account purchasekey
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
      dispatch(setShowingMetadataForm(true))
    } else {
      purchase()
    }
  }

  const props: LockVariations.LockProps = {
    onClick,
    formattedDuration: durationsAsTextFromSeconds(lock.expirationDuration),
    formattedKeyPrice,
    formattedKeysAvailable: lockKeysAvailable(lock),
    name: lock.name,
  }

  const keyForThisLock = activeKeys.find(key => key.lock === lock.address)

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
  return <LockVariations.PurchaseableLock {...props} />
}
