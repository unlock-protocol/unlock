import React from 'react'
import { DisabledLock, LoadingLock } from './LockVariations'
import { usePaywallLocks } from '../../../hooks/usePaywallLocks'
import {
  lockKeysAvailable,
  lockTickerSymbol,
} from '../../../utils/checkoutLockUtils'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import { PaywallConfig } from '../../../unlockTypes'

interface LocksProps {
  lockAddresses: string[]
  config: PaywallConfig
}

export const NotLoggedInLocks = ({ lockAddresses, config }: LocksProps) => {
  // Dummy function -- we don't have an account address so we cannot get balance
  const getTokenBalance = () => {}
  const { locks, loading } = usePaywallLocks(
    lockAddresses,
    getTokenBalance,
    config
  )

  if (loading) {
    return (
      <div>
        {lockAddresses.map(address => (
          <LoadingLock address={address} key={address} />
        ))}
      </div>
    )
  }

  return (
    <div>
      {locks.map(lock => (
        <DisabledLock
          address={lock.address}
          key={lock.address}
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
