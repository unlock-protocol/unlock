import React from 'react'
import { Lock } from './Lock'
import { LoadingLock } from './LockVariations'
import { usePaywallLocks } from '../../../hooks/usePaywallLocks'
import { useGetTokenBalance } from '../../../hooks/useGetTokenBalance'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { useKeyOwnershipStatus } from '../../../hooks/useKeyOwnershipStatus'

interface LocksProps {
  accountAddress: string
  lockAddresses: string[]
  emitTransactionInfo: (info: TransactionInfo) => void
  metadataRequired?: boolean
  showMetadataForm: () => void
}

export const Locks = ({
  lockAddresses,
  accountAddress,
  emitTransactionInfo,
  metadataRequired,
  showMetadataForm,
}: LocksProps) => {
  const { getTokenBalance, balances } = useGetTokenBalance(accountAddress)
  const { locks, loading } = usePaywallLocks(lockAddresses, getTokenBalance)
  const { keys } = useKeyOwnershipStatus(lockAddresses, accountAddress)

  const now = new Date().getTime() / 1000
  const activeKeys = keys.filter(key => key.expiration > now)

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
          emitTransactionInfo={emitTransactionInfo}
          balances={balances}
          activeKeys={activeKeys}
          accountAddress={accountAddress}
          metadataRequired={metadataRequired}
          showMetadataForm={showMetadataForm}
        />
      ))}
    </div>
  )
}
