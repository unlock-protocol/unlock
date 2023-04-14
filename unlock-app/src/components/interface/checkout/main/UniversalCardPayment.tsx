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
import {
  usePaymentMethodList,
  useRemovePaymentMethods,
} from '~/hooks/usePaymentMethods'
import { CryptoElements, OnrampElement } from '../utils/CryptoElements'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function UniversalCardPayment({
  checkoutService,
  injectedProvider,
}: Props) {
  const config = useConfig()
  const [onrampSession, setOnrampSession] = useState<any>(null)
  const stripeOnrampPromise = loadStripeOnramp(config.stripeApiKey)

  const stepItems = useCheckoutSteps(checkoutService)

  useEffect(() => {
    // TODO: we want to get the user's signature first...
    // so that we take no risk having the funds on the account
    // but no signature to spend them...
    const getOnrampSession = async () => {
      const response = await storage.onramp()
      setOnrampSession(response.data.session)
    }
    getOnrampSession()
  }, [])

  const onChange = (event: any) => {
    console.log('changed', event)
  }

  return (
    <Fragment>
      <Stepper position={4} service={checkoutService} items={stepItems} />
      <main className="">
        <CryptoElements stripeOnramp={stripeOnrampPromise}>
          {onrampSession?.client_secret && (
            <OnrampElement
              clientSecret={onrampSession.client_secret}
              onChange={onChange}
              appearance={{}}
              onReady={console.log}
            />
          )}
        </CryptoElements>
      </main>

      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          {/* {!card ? (
            <Button
              loading={isSaving}
              disabled={isMethodLoading || isSaving || !stripe}
              type="submit"
              form="payment"
              className="w-full"
            >
              Next
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={!card}
              onClick={() => {
                checkoutService.send({
                  type: 'SELECT_PAYMENT_METHOD',
                  payment: {
                    method: 'card',
                    cardId: payment!.id!,
                  },
                })
              }}
            >
              Continue
            </Button>
          )} */}
        </Connected>
        <PoweredByUnlock />
      </footer>
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
