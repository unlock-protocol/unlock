import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from 'react-query'
import { deleteCardForAddress } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { useWalletService } from '~/utils/withWalletService'
import { Fragment, useState } from 'react'
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
import { useCheckoutSteps } from './useCheckoutItems'
import { useStorageService } from '~/utils/withStorageService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useForm } from 'react-hook-form'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function CardPayment({ checkoutService, injectedProvider }: Props) {
  const { account, network } = useAuth()
  const storageService = useStorageService()
  const config = useConfig()
  const walletService = useWalletService()
  const stripe = loadStripe(config.stripeApiKey, {})
  const [isSaving, setIsSaving] = useState(false)

  const {
    data: methods,
    isLoading: isMethodLoading,
    refetch,
  } = useQuery(
    ['list-cards', account],
    async () => {
      await storageService.loginPrompt({
        walletService,
        address: account!,
        chainId: network!,
      })
      return storageService.listCardMethods()
    },
    {
      enabled: !!account,
    }
  )

  const card = methods?.[0]?.card
  const stepItems = useCheckoutSteps(checkoutService)

  return (
    <Fragment>
      <Stepper position={4} service={checkoutService} items={stepItems} />
      <main className="h-full px-6 py-2 overflow-auto">
        {isMethodLoading ? (
          <CardPlaceholder />
        ) : !card ? (
          <SetupForm
            stripe={stripe}
            onSubmit={() => {
              setIsSaving(true)
            }}
            onSuccess={async () => {
              setIsSaving(false)
              await refetch()
            }}
          />
        ) : (
          <Card
            onChange={async () => {
              await deleteCardForAddress(config, walletService, account!)
              await refetch()
            }}
            {...card}
          />
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          {!card ? (
            <Button
              loading={isSaving}
              disabled={isMethodLoading || isSaving || !stripe}
              type="submit"
              form="payment"
              className="w-full"
            >
              Save
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={!card}
              onClick={() => {
                checkoutService.send({
                  type: 'SELECT_CARD_TO_CHARGE',
                  cardId: card.id,
                })
              }}
            >
              Continue
            </Button>
          )}
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}

interface SetupFormProps {
  onSubmit(): void
  onSuccess(intent?: SetupIntentResult): void
  stripe: Promise<Stripe | null>
}

export function SetupForm({ onSubmit, stripe, onSuccess }: SetupFormProps) {
  const storageService = useStorageService()
  const walletService = useWalletService()
  const { account, network } = useAuth()
  const { data: clientSecret, refetch } = useQuery(
    ['checkout-setup-intent'],
    async () => {
      await storageService.loginPrompt({
        walletService,
        address: account!,
        chainId: network!,
      })
      const secret = await storageService.getSetupIntent()
      return secret
    },
    {
      refetchInterval: false,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  )

  if (!clientSecret) {
    return null
  }

  const onError = async (error: StripeError) => {
    ToastHelper.error(error.message!)
    await refetch()
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
