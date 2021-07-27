import React, { useContext, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { Lock } from './Lock'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { AuthenticationContext } from '../Authenticate'
import { useAccount } from '../../../hooks/useAccount'
import { Button } from './FormStyles'
import { EnjoyYourMembership } from './EnjoyYourMembership'
import Svg from '../svg'

interface CardConfirmationCheckoutProps {
  emitTransactionInfo: (info: TransactionInfo) => void
  lock: any
  network: number
  name: string
  closeModal: (success: boolean) => void
  card: any
  token: string
}

export const CardConfirmationCheckout = ({
  emitTransactionInfo,
  lock,
  network,
  name,
  closeModal,
  card,
  token,
}: CardConfirmationCheckoutProps) => {
  const { account } = useContext(AuthenticationContext)
  const { chargeCard } = useAccount(account, network)
  const [purchasePending, setPurchasePending] = useState(false)
  const [keyExpiration, setKeyExpiration] = useState(0)
  const [error, setError] = useState('')
  // Convenience
  const now = new Date().getTime() / 1000
  const hasValidkey = keyExpiration > now && keyExpiration < Infinity
  const hasOptimisticKey = keyExpiration === Infinity

  const totalPrice: number = Object.values(lock.fiatPricing.usd).reduce(
    (s: number, x: number): number => s + x,
    0
  ) as number
  const fee = totalPrice - lock.fiatPricing.usd.keyPrice
  const formattedPrice = (totalPrice / 100).toFixed(2)

  const charge = async () => {
    setError('')
    setPurchasePending(true)
    try {
      const hash = await chargeCard(
        token,
        lock.address,
        network,
        formattedPrice
      )
      if (hash) {
        emitTransactionInfo({
          lock: lock.address,
          hash,
        })
        setKeyExpiration(Infinity) // Optimistic!
      } else {
        setError('Purchase failed. Please try again.')
      }
      setPurchasePending(false)
    } catch (error) {
      console.error(error)
      setError('Purchase failed. Please try again.')
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
          Unfortunately, credit card is not available for this lock. You need to
          purchase using a crypto-wallet.
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
            Pay ${formattedPrice} with Card
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <FeeNotice>
            Includes ${(fee / 100).toFixed(2)} in fees{' '}
            <Link href="https://docs.unlock-protocol.com/governance/frequently-asked-questions#what-are-the-credit-card-fees">
              <a target="_blank">
                <InfoIcon />
              </a>
            </Link>
          </FeeNotice>
          <CardNumber>Card ending in {card.last4}</CardNumber>
        </>
      )}
      {hasValidkey && (
        <>
          <Message>You already have a valid membership for this lock!</Message>
          <EnjoyYourMembership closeModal={closeModal} />
        </>
      )}
      {hasOptimisticKey && <EnjoyYourMembership closeModal={closeModal} />}
    </Wrapper>
  )
}

export default CardConfirmationCheckout

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const InfoIcon = styled(Svg.Info)`
  background-color: var(--green);
  border-radius: 50%;
  height: 18px;
  margin-left: 4px;
  fill: var(--white);
`

export const FeeNotice = styled.p`
  margin-top: 8px;
  display: flex;
  align-content: center;
  text-align: center;
  justify-content: center;
  color: var(--green);
`

export const CardNumber = styled.p`
  text-align: center;
  color: var(--grey);
`

const Message = styled.p`
  text-align: left;
  font-size: 13px;
  width: 100%;
`

const ErrorMessage = styled(Message)`
  color: var(--red);
`
