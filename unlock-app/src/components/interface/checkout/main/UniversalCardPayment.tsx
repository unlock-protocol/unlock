import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { loadStripeOnramp } from '@stripe/crypto'

import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useCheckoutSteps } from './useCheckoutItems'
import { storage } from '~/config/storage'
import { CryptoElements, OnrampElement } from '../utils/CryptoElements'
import { CreditCardPricingBreakdown, PricingData } from './Confirm'
import { useActor } from '@xstate/react'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { ViewContract } from '../ViewContract'
import { useUniversalCardPrice } from '~/hooks/useUniversalCardPrice'
import { useAuth } from '~/contexts/AuthenticationContext'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  communication?: CheckoutCommunication
}

export function UniversalCardPayment({
  checkoutService,
  injectedProvider,
  communication,
}: Props) {
  const { getWalletService, account } = useAuth()
  const [state, send] = useActor(checkoutService)
  const config = useConfig()
  const [sessionError, setSessionError] = useState<string>(null)
  const [onrampSession, setOnrampSession] = useState<any>(null)
  const stripeOnrampPromise = loadStripeOnramp(config.stripeApiKey)

  const { lock, recipients, captcha, paywallConfig, password, promo } =
    state.context

  const stepItems = useCheckoutSteps(checkoutService)

  // Build the `purchaseData` field that gets passed to the contract
  const { isInitialLoading: isInitialDataLoading, data: purchaseData } =
    usePurchaseData({
      lockAddress: lock!.address,
      network: lock!.network,
      promo,
      password,
      captcha,
      paywallConfig,
      recipients,
    })

  // And now get the price to pay by card
  // do we need the step above in fact?
  // Not really...
  const { data: cardPricing, isInitialLoading: isCardPricingLoading } =
    useUniversalCardPrice({
      network: lock!.network,
      lockAddress: lock!.address,
      recipients,
      purchaseData: purchaseData!,
      enabled: !isInitialDataLoading,
    })

  // TODO: Also configure webhook on the Stripe side!
  const onChange = async (event: any) => {
    const { session } = event

    if (session.wallet_address && session.wallet_address !== account) {
      setSessionError(
        'You cannot change the recipient address as it is the address that will receive the NFT membership token. Please start again.'
      )
    }

    const expectedAmount = (cardPricing!.total / 100).toString()
    if (
      session.quote.destination_amount &&
      session.quote.destination_amount !== expectedAmount
    ) {
      setSessionError('You cannot change the amount.')
    }

    if (session.status === 'fulfillment_complete') {
      const response = await storage.captureOnRampSession(
        session.id,
        session.quote.blockchain_tx_id
      )
      const transactionHash = response.data.transactionHash
      if (transactionHash) {
        communication?.emitTransactionInfo({
          hash: transactionHash,
          lock: lock!.address,
        })
        send({
          type: 'CONFIRM_MINT',
          transactionHash,
          status: 'PROCESSING',
        })
      } else {
        console.error(
          'Transaction could not be sent... This is bad, because we captured the payment... hopefully we can quickly handle retries before the signature expires!'
        )
        // TODO: show error state!
      }
    }
  }

  const signPermit = async () => {
    const walletService = await getWalletService(lock!.network)
    const { signature, message } =
      await walletService.getAndSignUSDCTransferAuthorization({
        amount: cardPricing!.total, // value in cents
      })
    // We need to pass recipients and purchaseData as well... as these will be used for the onchain transaction!
    const response = await storage.createOnRampSession(
      lock!.network,
      lock!.address,
      {
        signature,
        message,
        recipients,
        purchaseData: purchaseData!,
      }
    )
    setOnrampSession(response.data.session)
  }

  if (isCardPricingLoading || !cardPricing) {
    return null
  }

  return (
    <Fragment>
      <Stepper position={4} service={checkoutService} items={stepItems} />
      {/* Show confirmation first */}
      {!onrampSession?.client_secret && (
        <>
          <main className="h-full px-6 py-2 overflow-auto">
            <div className="grid gap-y-2">
              <div>
                <h4 className="text-xl font-bold"> {lock!.name}</h4>
                <ViewContract
                  lockAddress={lock!.address}
                  network={lock!.network}
                />
              </div>
              <PricingData
                network={lock!.network}
                lock={lock!}
                pricingData={cardPricing}
              />
            </div>
            <CreditCardPricingBreakdown
              total={cardPricing!.total}
              creditCardProcessingFee={cardPricing!.creditCardProcessingFee}
              unlockServiceFee={cardPricing!.unlockServiceFee}
            />
          </main>
          <footer className="grid items-center px-6 pt-6 border-t">
            <Connected
              injectedProvider={injectedProvider}
              service={checkoutService}
            >
              <Button
                // loading={isSaving}
                disabled={isCardPricingLoading}
                type="submit"
                form="payment"
                className="w-full"
                onClick={signPermit}
              >
                Checkout with Stripe
              </Button>
            </Connected>
            <PoweredByUnlock />
          </footer>
        </>
      )}

      {/* Show error */}
      {sessionError && (
        <>
          <main className="h-full px-6 py-2 overflow-auto">
            <p>{sessionError}</p>
          </main>
          <footer className="grid items-center px-6 pt-6 border-t">
            <Connected
              injectedProvider={injectedProvider}
              service={checkoutService}
            >
              <Button
                disabled={isCardPricingLoading}
                type="submit"
                form="payment"
                className="w-full"
                onClick={() => {
                  setSessionError('')
                  setOnrampSession(null)
                }}
              >
                Restart
              </Button>
            </Connected>
            <PoweredByUnlock />
          </footer>
        </>
      )}

      {/* Show Stripe form */}
      {!sessionError && onrampSession?.client_secret && (
        <main className="">
          <CryptoElements stripeOnramp={stripeOnrampPromise}>
            <OnrampElement
              clientSecret={onrampSession.client_secret}
              onChange={onChange}
              appearance={{
                theme: 'stripe',
              }}
            />
          </CryptoElements>
        </main>
      )}
    </Fragment>
  )
}
