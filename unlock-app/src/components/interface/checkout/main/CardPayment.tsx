import { CheckoutService } from './checkoutMachine'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { Card, CardPlaceholder } from '../Card'
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
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useForm } from 'react-hook-form'
import { locksmith } from '~/config/locksmith'
import {
  usePaymentMethodList,
  useRemovePaymentMethods,
} from '~/hooks/usePaymentMethods'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Props {
  checkoutService: CheckoutService
}

export function CardPayment({ checkoutService }: Props) {
  const config = useConfig()
  const stripe = loadStripe(config.stripeApiKey, {})
  const [isSaving, setIsSaving] = useState(false)

  const {
    data: methods,
    isInitialLoading: isMethodLoading,
    refetch: refetchPaymentMethods,
  } = usePaymentMethodList()
  const { mutateAsync: removePaymentMethods } = useRemovePaymentMethods()

  const payment = methods?.[0]
  const card = payment?.card

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        {isMethodLoading ? (
          <CardPlaceholder />
        ) : !card ? (
          <SetupForm
            stripe={stripe}
            onSubmit={() => {
              setIsSaving(true)
            }}
            onError={() => {
              setIsSaving(false)
            }}
            onSuccess={async () => {
              setIsSaving(false)
              await refetchPaymentMethods()
            }}
          />
        ) : (
          <Card
            name={payment!.billing_details?.name || ''}
            last4={card.last4!}
            exp_month={card.exp_month!}
            exp_year={card.exp_year!}
            country={card.country!}
            onChange={async () => {
              await removePaymentMethods()
              await refetchPaymentMethods()
            }}
          />
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        {!card ? (
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
        )}
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
    const response = await locksmith.setupPayment()
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
    setValue,
    getValues,
    handleSubmit,
  } = useForm<{
    name: string
    email: string
  }>({
    defaultValues: {
      email: '',
    },
  })
  const { email } = useAuthenticate()
  // state to check if the email field should be filled with the user's email address
  const [fillUnlockEmail, setFillUnlockEmail] = useState<boolean>(!!email)

  useEffect(() => {
    // this effect ensures that the form default value updates when the authentication context changes
    if (email) {
      setValue('email', email)
      setFillUnlockEmail(!!email)
    }
  }, [email, setValue])

  const onHandleSubmit = async ({
    name,
    email: emailAddress,
  }: Record<'name' | 'email', string>) => {
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
            email: emailAddress,
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
      <div className="flex flex-col w-full">
        <label className="text-sm text-gray-700" htmlFor="name">
          Email
        </label>

        {fillUnlockEmail ? (
          <div className="flex items-center pl-4 pr-2 py-2 justify-between bg-gray-200 rounded-md">
            <div className="w-32 text-sm truncate">{getValues('email')}</div>
            <Button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                setFillUnlockEmail(false)
              }}
              size="tiny"
            >
              Change
            </Button>
          </div>
        ) : (
          <input
            disabled={isSubmitting}
            id="email"
            className={`border-gray-200 rounded shadow-sm outline-none appearance-none focus:border-gray-200 focus:ring-2 focus:outline-none focus:shadow-outline focus:ring-blue-200 ${
              errors.email && 'border-red-600 border-2'
            }`}
            type="email"
            {...register('email', {
              value: getValues('email') || undefined,
              required: 'Email address is required',
            })}
          />
        )}

        <p className="mt-2 text-sm text-red-600">{errors.email?.message}</p>
      </div>
      <PaymentElement />
    </form>
  )
}
