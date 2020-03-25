import React, { useState } from 'react'
import { Card } from '@stripe/stripe-js'
import { FiatLock } from './FiatLock'
import { DisabledLock, LoadingLock } from './LockVariations'
import { usePaywallLocks } from '../../../hooks/usePaywallLocks'
import { useFiatKeyPrices } from '../../../hooks/useFiatKeyPrices'
import { useKeyOwnershipStatus } from '../../../hooks/useKeyOwnershipStatus'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import {
  lockKeysAvailable,
  lockTickerSymbol,
} from '../../../utils/checkoutLockUtils'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import { PaymentDetails } from './PaymentDetails'

interface LocksProps {
  lockAddresses: string[]
  accountAddress: string
  emitTransactionInfo: (info: TransactionInfo) => void
  cards: Card[]
}

interface PaymentFormState {
  visible: boolean
  invokePurchase?: () => void
}

export const FiatLocks = ({
  lockAddresses,
  accountAddress,
  emitTransactionInfo,
  cards,
}: LocksProps) => {
  // Dummy function -- we don't have an account address so we cannot get balance
  const getTokenBalance = () => {}
  const { locks, loading } = usePaywallLocks(lockAddresses, getTokenBalance)
  const fiatKeyPrices = useFiatKeyPrices(lockAddresses)
  const { keys } = useKeyOwnershipStatus(lockAddresses, accountAddress)
  const [showingPaymentForm, setShowingPaymentForm] = useState<
    PaymentFormState
  >({ visible: false })

  const needToCollectPaymentDetails = cards.length === 0

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

  if (showingPaymentForm.visible) {
    return (
      <PaymentDetails
        setShowingPaymentForm={setShowingPaymentForm}
        invokePurchase={showingPaymentForm.invokePurchase!}
      />
    )
  }

  return (
    <div>
      {locks.map(lock => {
        if (fiatKeyPrices[lock.address]) {
          // prices returned from locksmith are in cents
          const basePrice = parseInt(fiatKeyPrices[lock.address].usd)
          const formattedPrice = (basePrice / 100).toFixed(2)
          const fiatPrice = `$${formattedPrice}`
          return (
            <FiatLock
              key={lock.name}
              lock={lock}
              formattedKeyPrice={fiatPrice}
              activeKeys={activeKeys}
              accountAddress={accountAddress}
              emitTransactionInfo={emitTransactionInfo}
              needToCollectPaymentDetails={needToCollectPaymentDetails}
              setShowingPaymentForm={setShowingPaymentForm}
            />
          )
        }

        return (
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
        )
      })}
    </div>
  )
}
