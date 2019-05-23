import React from 'react'

import PendingKeyLock from '../lock/PendingKeyLock'
import ConfirmingKeyLock from '../lock/ConfirmingKeyLock'
import ConfirmedKeyLock from '../lock/ConfirmedKeyLock'
import NoKeyLock from '../lock/NoKeyLock'

import { Lock, Account, KeyStatus } from '../../unlockTypes'

interface Props {
  lock: Lock
  disabled: boolean
  account: Account
  purchase: (...args: any[]) => any
  clickOnConfirmedLock: (...args: any[]) => any
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
  clickOnConfirmedLock,
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
    return <ConfirmedKeyLock lock={lock} onClick={clickOnConfirmedLock} />
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
