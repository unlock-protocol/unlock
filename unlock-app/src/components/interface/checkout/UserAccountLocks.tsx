import React from 'react'
import { DisabledLock, LoadingLock } from './LockVariations'
import { usePaywallLocks } from '../../../hooks/usePaywallLocks'
import { useFiatKeyPrices, KeyPrices } from '../../../hooks/useFiatKeyPrices'
import {
  lockKeysAvailable,
  lockTickerSymbol,
} from '../../../utils/checkoutLockUtils'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import { RawLock } from '../../../unlockTypes'

interface LocksProps {
  lockAddresses: string[]
}

export const renderLock = (lock: RawLock, prices: KeyPrices) => {
  if (prices[lock.address]) {
    // prices returned from locksmith are in cents
    const basePrice = parseInt(prices[lock.address].usd)
    const formattedPrice = (basePrice / 100).toFixed(2)
    const fiatPrice = `$${formattedPrice}`
    return (
      <DisabledLock
        key={lock.name}
        name={lock.name}
        formattedKeyPrice={fiatPrice}
        formattedKeysAvailable={lockKeysAvailable(lock)}
        formattedDuration={durationsAsTextFromSeconds(lock.expirationDuration)}
        onClick={() => {}}
      />
    )
  }

  return (
    <DisabledLock
      key={lock.name}
      name={lock.name}
      formattedKeyPrice={`${lock.keyPrice} ${lockTickerSymbol(lock)}`}
      formattedKeysAvailable={lockKeysAvailable(lock)}
      formattedDuration={durationsAsTextFromSeconds(lock.expirationDuration)}
      onClick={() => {}}
    />
  )
}

export const UserAccountLocks = ({ lockAddresses }: LocksProps) => {
  // Dummy function -- we don't have an account address so we cannot get balance
  const getTokenBalance = () => {}
  const { locks, loading } = usePaywallLocks(lockAddresses, getTokenBalance)
  const fiatKeyPrices = useFiatKeyPrices(lockAddresses)

  if (loading) {
    return (
      <div>
        {lockAddresses.map(address => (
          <LoadingLock key={address} />
        ))}
      </div>
    )
  }

  return <div>{locks.map(lock => renderLock(lock, fiatKeyPrices))}</div>
}
