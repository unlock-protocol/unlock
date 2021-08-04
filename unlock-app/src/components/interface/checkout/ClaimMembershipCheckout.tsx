import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { Lock } from './Lock'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { AuthenticationContext } from '../Authenticate'
import { useAccount } from '../../../hooks/useAccount'
import { Button } from './FormStyles'
import { EnjoyYourMembership } from './EnjoyYourMembership'
import { PaywallConfig } from '../../../unlockTypes'

interface ClaimMembershipCheckoutProps {
  emitTransactionInfo: (info: TransactionInfo) => void
  lock: any
  network: number
  name: string
  closeModal: (success: boolean) => void
  card: any
  token: string
  paywallConfig: PaywallConfig
}

export const ClaimMembershipCheckout = ({
  emitTransactionInfo,
  lock,
  network,
  name,
  closeModal,
  card,
  token,
  paywallConfig,
}: ClaimMembershipCheckoutProps) => {
  const { account } = useContext(AuthenticationContext)
  const { claimMembershipFromLock } = useAccount(account, network)
  const [purchasePending, setPurchasePending] = useState(false)
  const [keyExpiration, setKeyExpiration] = useState(0)
  const [error, setError] = useState('')
  // Convenience
  const now = new Date().getTime() / 1000
  const hasValidkey = keyExpiration > now && keyExpiration < Infinity
  const hasOptimisticKey = keyExpiration === Infinity

  const charge = async () => {
    setError('')
    setPurchasePending(true)
    try {
      const hash = await claimMembershipFromLock(lock.address, network)
      if (hash) {
        // If not Optimistic, let's wait for transaction to be mined!
        emitTransactionInfo({
          lock: lock.address,
          hash,
        })
        setKeyExpiration(Infinity) // Optimistic!
      } else {
        setError('Claim failed. Please try again.')
      }
      setPurchasePending(false)
    } catch (error) {
      console.error(error)
      setError('Claim failed. Please try again.')
      setPurchasePending(false)
    }
  }

  const handleHasKey = (key: any) => {
    setKeyExpiration(key.expiration)
  }

  if (!lock.fiatPricing?.creditCardEnabled) {
    return (
      <Wrapper>
        <Lock
          network={network}
          lock={lock}
          name={name}
          setHasKey={handleHasKey}
          onSelected={null}
          hasOptimisticKey={hasOptimisticKey}
          purchasePending={purchasePending}
        />
        <ErrorMessage>
          Unfortunately, you cannot claim a membership from this lock. You need
          to send a transaction using a crypto-wallet.
        </ErrorMessage>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Lock
        network={network}
        lock={lock}
        name={name}
        setHasKey={handleHasKey}
        onSelected={null}
        hasOptimisticKey={hasOptimisticKey}
        purchasePending={purchasePending}
      />

      {!hasValidkey && !hasOptimisticKey && (
        <>
          <Button disabled={purchasePending} onClick={charge}>
            Claim your membership
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </>
      )}
      {hasValidkey && (
        <>
          <Message>You already have a valid membership for this lock!</Message>
          <EnjoyYourMembership
            paywallConfig={paywallConfig}
            closeModal={closeModal}
          />
        </>
      )}
      {hasOptimisticKey && (
        <EnjoyYourMembership
          paywallConfig={paywallConfig}
          closeModal={closeModal}
        />
      )}
    </Wrapper>
  )
}

export default ClaimMembershipCheckout

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const Message = styled.p`
  text-align: left;
  font-size: 13px;
  width: 100%;
`

const ErrorMessage = styled(Message)`
  color: var(--red);
`
