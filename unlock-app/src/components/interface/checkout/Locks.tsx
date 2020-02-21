import React from 'react'
import { Lock, LoadingLock } from './Lock'
import { usePaywallLocks } from '../../../hooks/usePaywallLocks'
import { useGetTokenBalance } from '../../../hooks/useGetTokenBalance'

interface LocksProps {
  accountAddress: string
  lockAddresses: string[]
}

export const Locks = ({ accountAddress, lockAddresses }: LocksProps) => {
  const { balances, getTokenBalance } = useGetTokenBalance(accountAddress)
  const { locks, loading } = usePaywallLocks(lockAddresses, getTokenBalance)

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
        <Lock lock={lock} balances={balances} key={lock.name} />
      ))}
    </div>
  )
}
