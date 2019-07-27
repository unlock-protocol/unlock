import React from 'react'

import ConfirmedFlag from './ConfirmedFlag'
import ConfirmingFlag from './ConfirmingFlag'
import { Transaction, KeyStatus } from '../../unlockTypes'

interface OptimisticProps {
  hideModal: () => void
  requiredConfirmations: number
  transaction: Transaction
  optimism: { current: number }
  keyStatus: KeyStatus
}

export default function OptimisticOverlay({
  hideModal,
  requiredConfirmations,
  transaction,
  optimism,
  keyStatus,
}: OptimisticProps) {
  if (!optimism.current || ['expired', 'none'].includes(keyStatus)) {
    return null
  }
  if (keyStatus === 'confirmed' || keyStatus === 'valid') {
    return <ConfirmedFlag dismiss={hideModal} />
  }
  return (
    <ConfirmingFlag
      transaction={transaction}
      requiredConfirmations={requiredConfirmations}
    />
  )
}
