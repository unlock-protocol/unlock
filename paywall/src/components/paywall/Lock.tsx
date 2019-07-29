import React from 'react'

import PendingKeyLock from './PendingKeyLock'
import ConfirmingKeyLock from './ConfirmingKeyLock'
import ConfirmedKeyLock from './ConfirmedKeyLock'
import NoKeyLock from './NoKeyLock'
import usePurchaseKey from '../../hooks/usePurchaseKey'
import { Transaction, Lock as LockType, Account, Key } from '../../unlockTypes'

interface LockProps {
  account: Account | null
  lock: LockType
  lockKey?: Key
  transaction?: Transaction
  purchaseKey: (lockKey: string) => void
  disabled?: boolean
  hideModal: () => void
  openInNewWindow: boolean
  keyStatus: string
}

export default function Lock({
  account = null,
  lock,
  lockKey,
  transaction,
  purchaseKey,
  disabled = false,
  hideModal,
  openInNewWindow,
  keyStatus,
}: LockProps) {
  const purchase = usePurchaseKey(purchaseKey, openInNewWindow)
  switch (keyStatus) {
    case 'submitted':
    case 'pending':
      return <PendingKeyLock lock={lock} />
    case 'confirming':
      return <ConfirmingKeyLock lock={lock} transaction={transaction} />
    case 'confirmed':
    case 'valid':
      return <ConfirmedKeyLock lock={lock} onClick={hideModal} />
    case 'none':
    case 'expired':
    default:
      return (
        <NoKeyLock
          account={account}
          lock={lock}
          disabled={disabled}
          purchaseKey={purchase}
          lockKey={lockKey}
        />
      )
  }
}
