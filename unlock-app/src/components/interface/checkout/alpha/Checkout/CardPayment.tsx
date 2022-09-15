import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from 'react-query'
import { deleteCardForAddress } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { Button, Input } from '@unlock-protocol/ui'
import { useWalletService } from '~/utils/withWalletService'
import {
  FormEventHandler,
  Fragment,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { Card, CardPlaceholder } from '../Card'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe, SetupIntentResult, Stripe } from '@stripe/stripe-js'
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
  const [editCard, setEditCard] = useState(false)
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
      staleTime: Infinity,
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
        ) : editCard || !card ? (
          <Setup
            stripe={stripe}
            onSubmit={() => {
              setIsSaving(true)
            }}
            onSubmitted={async () => {
              setIsSaving(false)
              await refetch()
              setEditCard(false)
            }}
          />
        ) : (
          <Card
            onChange={async () => {
              await deleteCardForAddress(config, walletService, account!)
              setEditCard(true)
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
          {editCard || !card ? (
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

interface SetupProps {
  onSubmit(): void
  onSubmitted(intent?: SetupIntentResult): void
  stripe: Promise<Stripe | null>
}

export function Setup({ onSubmit, stripe, onSubmitted }: SetupProps) {
  const storageService = useStorageService()
  const [clientSecret, setClientSecret] = useState('')
  const walletService = useWalletService()
  const { account, network } = useAuth()

  const fetchSecret = useCallback(async () => {
    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network!,
    })
    const secret = await storageService.getSetupIntent()
    setClientSecret(secret)
  }, [storageService, account, network, walletService])

  useEffect(() => {
    if (!clientSecret) {
      fetchSecret()
    }
  }, [fetchSecret, clientSecret])

  if (!clientSecret) {
    return null
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',

          variables: {
            colorBackground: '#fff',
          },
        },
      }}
    >
      <PaymentForm onSubmit={onSubmit} onSubmitted={onSubmitted} />
    </Elements>
  )
}

interface PaymentFormProps {
  onSubmit(): void
  onSubmitted(intent?: SetupIntentResult): void
}

export function PaymentForm({ onSubmit, onSubmitted }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const {
    register,
    formState: { errors },
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
      ToastHelper.error(error.message!)
      onSubmitted(undefined)
    } else {
      const intent = await stripe.retrieveSetupIntent(
        setupIntent.client_secret!
      )
      onSubmitted(intent)
    }
  }
  return (
    <form
      className="space-y-1"
      onSubmit={handleSubmit(onHandleSubmit)}
      id="payment"
    >
      <div className="px-2">
        <Input
          error={errors?.name?.message}
          label="Name"
          autoComplete="name"
          {...register('name')}
        />
      </div>
      <PaymentElement />
    </form>
  )
}
