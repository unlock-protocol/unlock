import React from 'react'
import { Lock, LoadingLock } from './Lock'
import { usePaywallLocks } from '../../../hooks/usePaywallLocks'

interface LocksProps {
  accountAddress: string
  lockAddresses: string[]
}

export const Locks = ({ lockAddresses }: LocksProps) => {
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
        <Lock lock={lock} key={lock.name} />
      ))}
    </div>
  )
}
