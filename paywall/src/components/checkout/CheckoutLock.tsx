import React from 'react'

import PendingKeyLock from '../lock/PendingKeyLock'
import ConfirmingKeyLock from '../lock/ConfirmingKeyLock'
import ConfirmedKeyLock from '../lock/ConfirmedKeyLock'
import NoKeyLock from '../lock/NoKeyLock'

import { Lock, Account, KeyStatus, Key } from '../../unlockTypes'

interface Props {
  lock: Lock
  disabled: boolean
  account: Account | null
  purchase: (key: Key) => void
  hideCheckout: (...args: any[]) => void
}

/**
 * This component is always called with :
 * - the lock
 * - the account
 * - disabled flag if key should not be purchased on that lock
 * - purchase: a function to invoke when purchasing
 */
export const CheckoutLock = ({
  lock,
  account,
  disabled,
  purchase,
  hideCheckout,
}: Props) => {
  const { key } = lock

  if (key.status === KeyStatus.SUBMITTED) {
    return <PendingKeyLock lock={lock} />
  }

  if (key.status === KeyStatus.PENDING) {
    return <PendingKeyLock lock={lock} />
  }

  if (key.status === KeyStatus.CONFIRMING) {
    // transactions are always ordered by recency.
    return <ConfirmingKeyLock lock={lock} transaction={key.transactions[0]} />
  }

  if (key.status === KeyStatus.VALID) {
    return <ConfirmedKeyLock lock={lock} onClick={hideCheckout} />
  }

  return (
    <NoKeyLock
      account={account}
      lock={lock}
      disabled={disabled}
      purchaseKey={purchase}
      lockKey={key}
    />
  )
}

export default CheckoutLock
