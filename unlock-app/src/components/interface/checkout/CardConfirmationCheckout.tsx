import React, { useContext, useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import Link from 'next/link'
import styled from 'styled-components'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'react-hot-toast'
import { Lock } from './Lock'
import { CheckoutCustomRecipient } from './CheckoutCustomRecipient'

import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { useAccount } from '../../../hooks/useAccount'
import { Button } from './FormStyles'
import { EnjoyYourMembership } from './EnjoyYourMembership'
import Svg from '../svg'
import { PaywallConfig } from '../../../unlockTypes'
import { ConfigContext } from '../../../utils/withConfig'
import { useAdvancedCheckout } from '../../../hooks/useAdvancedCheckout'
import { getFiatPricing } from '../../../hooks/useCards'

interface CardConfirmationCheckoutProps {
  emitTransactionInfo: (info: TransactionInfo) => void
  lock: any
  network: number
  name: string
  closeModal: (success: boolean) => void
  card: any
  token: string
  paywallConfig: PaywallConfig
  redirectUri: string
  recipients: any[]
}

export const CardConfirmationCheckout = ({
  emitTransactionInfo,
  lock,
  network,
  name,
  closeModal,
  card,
  token,
  paywallConfig,
  redirectUri,
  recipients,
}: CardConfirmationCheckoutProps) => {
  const config = useContext(ConfigContext)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const { account } = useContext(AuthenticationContext)
  const { prepareChargeForCard, captureChargeForCard } = useAccount(
    account || '',
    network
  )
  const [purchasePending, setPurchasePending] = useState(false)
  const [pricing, setPricing] = useState({
    keyPrice: 0,
    creditCardProcessing: 0,
    unlockServiceFee: 0,
  })
  const [keyExpiration, setKeyExpiration] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const now = new Date().getTime() / 1000
  const numberOfRecipients = useRef(0)
  const hasValidkey =
    keyExpiration === -1 || (keyExpiration > now && keyExpiration < Infinity)
  const hasOptimisticKey = keyExpiration === Infinity
  const purchaseRecipients = recipients.length
    ? recipients.map((item) => item.resolvedAddress)
    : [account]
  const {
    isAdvanced,
    setIsAdvanced,
    onRecipientChange,
    advancedRecipientValid,
    recipient,
    checkingRecipient,
  } = useAdvancedCheckout()

  useEffect(() => {
    // todo: we get numbers of recipients on page load, and when list is cleared we still have the count
    numberOfRecipients.current = recipients?.length || 1
  }, [])

  useEffect(() => {
    const fetchPricing = async () => {
      const price = await getFiatPricing(
        config,
        lock.address,
        network,
        numberOfRecipients.current || 1
      )
      setPricing(price.usd)
    }

    fetchPricing()
  }, [numberOfRecipients.current, lock.address, config, network])

  let totalPrice: number = 0
  let fee: number = 0

  if (lock.fiatPricing?.usd) {
    totalPrice = Object.values(pricing).reduce(
      (s: number, x: number): number => s + x,
      0
    )
    fee = totalPrice - pricing.keyPrice
  }

  const formattedPrice = (totalPrice / 100).toFixed(2)

  useEffect(() => {
    // Wait for pricing to load
    if (formattedPrice === '0.00') {
      return
    }

    const prepareCharge = async () => {
      const response = await prepareChargeForCard(
        token,
        lock.address,
        network,
        formattedPrice,
        purchaseRecipients
      )
      if (response.error || !response.clientSecret) {
        setError(
          `There was an error preparing your payment: ${
            response.error || 'please try again.'
          }`
        )
      } else if (response.clientSecret) {
        setPaymentIntent(response)
      }
      setLoading(false)
    }
    if (account) {
      prepareCharge()
    }
  }, [account, formattedPrice])

  useEffect(() => {
    const waitForTransaction = async (hash: string) => {
      if (config.networks[network]) {
        const provider = new ethers.providers.JsonRpcProvider(
          config.networks[network].provider
        )
        try {
          await provider.waitForTransaction(hash)
          setKeyExpiration(Infinity) // Optimistic!
          setPurchasePending(false)
        } catch (e) {
          console.error(e)
          setError('Purchase failed. Please refresh and try again.')
        }
      }
    }

    if (purchasePending && typeof purchasePending === 'string') {
      // If we have a hash, let's wait for it to be mined!
      waitForTransaction(purchasePending)
    }
  }, [purchasePending])

  const charge = async () => {
    if (!paymentIntent) {
      return toast.error('Purchase not ready.')
    }
    setError('')
    setPurchasePending(true)
    try {
      const stripe = await loadStripe(config.stripeApiKey, {
        stripeAccount: paymentIntent.stripeAccount,
      })
      if (!stripe) {
        setError(
          'We could not load Stripe. Please refresh the page to try again.'
        )
        return
      }
      const confirmation = await stripe.confirmCardPayment(
        paymentIntent.clientSecret
      )
      if (
        confirmation.error ||
        confirmation.paymentIntent?.status !== 'requires_capture'
      ) {
        setError(
          confirmation?.error?.message || 'We could not confirm your payment.'
        )
        setPurchasePending(false)
        return
      }

      // payment intent is confirmed, we should trigger the charge
      const hash = await captureChargeForCard(
        lock.address,
        network,
        purchaseRecipients,
        confirmation.paymentIntent.id
      )

      if (hash) {
        emitTransactionInfo({
          lock: lock.address,
          hash,
        })
        if (!paywallConfig.pessimistic) {
          setKeyExpiration(Infinity) // Optimistic!
          setPurchasePending(false)
        } else {
          setPurchasePending(hash)
        }
      } else {
        // TODO: show error message in user interface
        setError('Purchase failed. Please try again.')
        setPurchasePending(false)
      }
    } catch (error: any) {
      console.error(error)
      // TODO: show error message in user interface
      setError('Purchase failed. Please try again.')
      setPurchasePending(false)
    }
  }

  const handleHasKey = (key: any) => {
    if (!key) {
      setKeyExpiration(0)
    } else {
      setKeyExpiration(key.expiration)
    }
  }
  const recipientAddress = isAdvanced
    ? advancedRecipientValid
      ? recipient
      : ''
    : purchaseRecipients[0]

  if (!hasValidkey && !lock.fiatPricing?.creditCardEnabled) {
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
          recipient={recipientAddress}
          numberOfRecipients={recipients.length}
        />
        <ErrorMessage>
          Unfortunately, credit card is not available for this lock. You need to
          purchase using a crypto-wallet.
        </ErrorMessage>
      </Wrapper>
    )
  }

  const payDisabled =
    !paymentIntent ||
    (isAdvanced ? purchasePending || !advancedRecipientValid : purchasePending)

  return (
    <Wrapper>
      <Lock
        recipient={recipientAddress}
        network={network}
        lock={lock}
        name={name}
        setHasKey={handleHasKey}
        onSelected={null}
        hasOptimisticKey={hasOptimisticKey}
        purchasePending={purchasePending}
        numberOfRecipients={recipients.length}
      />

      {hasValidkey && (
        <>
          <Message>
            {!isAdvanced
              ? 'You already have a valid membership!'
              : 'Recipient already has a valid membership!'}
            &nbsp;
          </Message>
        </>
      )}

      <CheckoutCustomRecipient
        isAdvanced={isAdvanced}
        advancedRecipientValid={advancedRecipientValid}
        checkingRecipient={checkingRecipient}
        setIsAdvanced={setIsAdvanced}
        onRecipientChange={onRecipientChange}
      />

      {!hasValidkey && !hasOptimisticKey && (
        <>
          <Button disabled={payDisabled} onClick={charge}>
            {loading && <Svg.Loading title="loading" alt="loading" />}
            Pay ${formattedPrice} with Card
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {fee > 0 && (
            <FeeNotice>
              Includes ${(fee / 100).toFixed(2)} in fees{' '}
              <Link href="https://docs.unlock-protocol.com/unlock/creators/faq#what-are-the-credit-card-fees">
                <a target="_blank">
                  <InfoIcon />
                </a>
              </Link>
            </FeeNotice>
          )}

          <CardNumber>
            Card ending in {card.last4} (
            <a target="_blank" href="/settings">
              change
            </a>
            )
          </CardNumber>
        </>
      )}

      {purchasePending && typeof purchasePending === 'string' && (
        <Message>
          Waiting for your{' '}
          <a
            target="_blank"
            href={config.networks[network].explorer.urls.transaction(
              purchasePending
            )}
            rel="noreferrer"
          >
            NFT membership to be minted
          </a>
          ! This should take a few seconds :)
        </Message>
      )}

      {(hasValidkey || hasOptimisticKey) && (
        <EnjoyYourMembership
          redirectUri={redirectUri}
          closeModal={closeModal}
        />
      )}
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
