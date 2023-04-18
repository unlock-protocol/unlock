import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useCallback, useEffect, useState } from 'react'
// import { Card, CardPlaceholder } from '../Card'
import { loadStripeOnramp } from '@stripe/crypto'

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import {
  loadStripe,
  SetupIntentResult,
  Stripe,
  StripeError,
} from '@stripe/stripe-js'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useCheckoutSteps } from './useCheckoutItems'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useForm } from 'react-hook-form'
import { storage } from '~/config/storage'
import { CryptoElements, OnrampElement } from '../utils/CryptoElements'
import Link from 'next/link'
import { CreditCardPricingBreakdown, PricingData } from './Confirm'
import { useActor } from '@xstate/react'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { useTotalPrice } from '~/hooks/useTotalPrice'
import { ViewContract } from '../ViewContract'
import { useUniversalCardPrice } from '~/hooks/useUniversalCardPrice'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ethers } from 'ethers'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function UniversalCardPayment({
  checkoutService,
  injectedProvider,
}: Props) {
  const { getWalletService, account } = useAuth()
  const [state] = useActor(checkoutService)
  const config = useConfig()
  const [onrampSession, setOnrampSession] = useState<any>(null)
  const stripeOnrampPromise = loadStripeOnramp(config.stripeApiKey)

  const {
    lock,
    // TODO: how do we handle these?
    // quantity,
    recipients,
    // payment,
    captcha,
    // messageToSign,
    paywallConfig,
    password,
    promo,
    // keyManagers,
    // metadata,
  } = state.context

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

  // And now get the price to pay by card.
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

  const onChange = (event: any) => {
    console.log('changed', event)
    // when event.session.status === "fulfillment_complete", we're done!
    // We now just need to submit the request to locksmith to actually process the transaction
    // once we have the transaction hash, we resume our "regular" flow (showing the transaction in progress)
  }

  const signPermit = async () => {
    // TODO: Sign the permit
    // Pass it to the server as part of the onramp request!
    // Note: we must use permit on
    const walletService = await getWalletService(lock!.network)

    const { signature, message } =
      await walletService.getAndSignUSDCTransferAuthorization({
        network: lock!.network,
        amount: cardPricing!.total, // value in cents
      })
    const response = await storage.onramp({ message, signature })
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

              <p className="text-sm">
                We use{' '}
                <Link
                  target="_blank"
                  className="text-brand-ui-primary hover:underline"
                  href="https://stripe.com/"
                >
                  Stripe
                </Link>{' '}
                to support payment by card. You can use any card, including
                Visa, Mastercard or even Apple Pay and Google Pay.
              </p>
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

      {/* Show Stripe form first */}
      {onrampSession?.client_secret && (
        <main className="">
          <CryptoElements stripeOnramp={stripeOnrampPromise}>
            <OnrampElement
              clientSecret={onrampSession.client_secret}
              onChange={onChange}
              appearance={{}}
              onReady={console.log}
            />
          </CryptoElements>
        </main>
      )}
    </Fragment>
  )
}

interface SetupFormProps {
  onSubmit(): void
  onSuccess(intent?: SetupIntentResult): void
  onError?(error: StripeError): void
  stripe: Promise<Stripe | null>
}

export function SetupForm({
  onSubmit,
  stripe,
  onSuccess,
  onError: onErrorHandler,
}: SetupFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const fetchSetupIntent = useCallback(async () => {
    const response = await storage.setupPayment()
    const secret = response.data.clientSecret
    if (secret) {
      setClientSecret(secret)
    }
  }, [])

  useEffect(() => {
    fetchSetupIntent()
  }, [fetchSetupIntent])

  if (!clientSecret) {
    return null
  }

  const onError = async (error: StripeError) => {
    ToastHelper.error(error.message!)
    await fetchSetupIntent()
    onErrorHandler?.(error)
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <PaymentForm
        onSubmit={onSubmit}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}

interface PaymentFormProps {
  onSubmit(): void
  onSuccess(intent?: SetupIntentResult): void
  onError(error: StripeError): void
}

export function PaymentForm({
  onSubmit,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<{
    name: string
  }>()

  const onHandleSubmit = async ({ name }: Record<'name', string>) => {
    if (!stripe || !elements) {
      return
    }

    onSubmit()

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name,
          },
        },
      },
    })

    if (error) {
      onError(error)
    } else {
      const intent = await stripe.retrieveSetupIntent(
        setupIntent.client_secret!
      )
      onSuccess(intent)
    }
  }
  return (
    <form
      className="space-y-2"
      onSubmit={handleSubmit(onHandleSubmit)}
      id="payment"
    >
      <div className="flex flex-col w-full">
        <label className="text-sm text-gray-700" htmlFor="name">
          Name
        </label>
        <input
          disabled={isSubmitting}
          id="name"
          className={`border-gray-200 rounded shadow-sm outline-none appearance-none focus:border-gray-200 focus:ring-2 focus:outline-none focus:shadow-outline focus:ring-blue-200 ${
            errors.name && 'border-red-600 border-2'
          }`}
          type="text"
          {...register('name', {
            required: 'Name is required',
          })}
        />
        <p className="mt-2 text-sm text-red-600">{errors.name?.message}</p>
      </div>
      <PaymentElement />
    </form>
  )
}
