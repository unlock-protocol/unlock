import React, { useState } from 'react'
import { Lock, LoadingLock } from './Lock'
import { usePaywallLocks } from '../../../hooks/usePaywallLocks'

interface LocksProps {
  accountAddress: string
  lockAddresses: string[]
}

type PurchasingLockAddress = string | null

export const Locks = ({ lockAddresses }: LocksProps) => {
  const [purchasingLockAddress, setPurchasingLockAddress] = useState(
    null as PurchasingLockAddress
  )
  const { locks, loading } = usePaywallLocks(lockAddresses)

  if (loading) {
    return (
      <div>
        {lockAddresses.map(address => (
          <LoadingLock key={address} />
        ))}
      </div>
    )
  }

  return (
    <div>
      {locks.map(lock => (
        <Lock
          key={lock.name}
          lock={lock}
          purchasingLockAddress={purchasingLockAddress}
          setPurchasingLockAddress={setPurchasingLockAddress}
        />
      ))}
    </div>
  )
}
