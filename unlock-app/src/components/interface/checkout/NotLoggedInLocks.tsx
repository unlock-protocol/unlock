import React from 'react'
import { DisabledLock, LoadingLock } from './LockVariations'
import { usePaywallLocks } from '../../../hooks/usePaywallLocks'
import {
  lockKeysAvailable,
  lockTickerSymbol,
} from '../../../utils/checkoutLockUtils'
import { durationsAsTextFromSeconds } from '../../../utils/durations'

interface LocksProps {
  lockAddresses: string[]
}

export const NotLoggedInLocks = ({ lockAddresses }: LocksProps) => {
  // Dummy function -- we don't have an account address so we cannot get balance
  const getTokenBalance = () => {}
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
        <DisabledLock
          key={lock.name}
          name={lock.name}
          formattedKeyPrice={`${lock.keyPrice} ${lockTickerSymbol(lock)}`}
          formattedKeysAvailable={lockKeysAvailable(lock)}
          formattedDuration={durationsAsTextFromSeconds(
            lock.expirationDuration
          )}
          onClick={() => {}}
        />
      ))}
    </div>
  )
}
