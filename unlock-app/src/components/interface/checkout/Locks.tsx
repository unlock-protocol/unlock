import React from 'react'
import { Lock } from './Lock'
import { LoadingLock } from './LockVariations'
import { usePaywallLocks } from '../../../hooks/usePaywallLocks'
import { useGetTokenBalance } from '../../../hooks/useGetTokenBalance'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { useKeyOwnershipStatus } from '../../../hooks/useKeyOwnershipStatus'
import { PaywallConfig } from '../../../unlockTypes'

interface LocksProps {
  accountAddress: string
  lockAddresses: string[]
  emitTransactionInfo: (info: TransactionInfo) => void
  metadataRequired?: boolean
  showMetadataForm: () => void
  config: PaywallConfig
}

export const Locks = ({
  lockAddresses,
  accountAddress,
  emitTransactionInfo,
  metadataRequired,
  showMetadataForm,
  config,
}: LocksProps) => {
  const { getTokenBalance, balances } = useGetTokenBalance(accountAddress)
  const { locks, loading } = usePaywallLocks(
    lockAddresses,
    getTokenBalance,
    config
  )
  const { keys } = useKeyOwnershipStatus(lockAddresses, accountAddress)

  const now = new Date().getTime() / 1000
  const activeKeys = keys.filter((key) => key.expiration > now)

  if (loading) {
    return (
      <div>
        {lockAddresses.map((address) => (
          <LoadingLock address={address} key={address} />
        ))}
      </div>
    )
  }

  return (
    <div>
      {locks.map((lock) => (
        <Lock
          key={lock.address}
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

Locks.defaultProps = {
  metadataRequired: false,
}
