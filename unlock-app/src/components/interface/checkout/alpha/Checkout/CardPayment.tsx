import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from 'react-query'
import { deleteCardForAddress } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { useWalletService } from '~/utils/withWalletService'
import { FormEventHandler, Fragment, useState, useEffect } from 'react'
import { Card, CardPlaceholder } from '../Card'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useCheckoutSteps } from './useCheckoutItems'
import { useStorageService } from '~/utils/withStorageService'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function CardPayment({ checkoutService, injectedProvider }: Props) {
  const { account } = useAuth()
  const [editCard, setEditCard] = useState(false)
  const storageService = useStorageService()
  const config = useConfig()
  const walletService = useWalletService()
  const {
    data: methods,
    isLoading: isMethodLoading,
    refetch,
  } = useQuery(
    ['list-cards', account],
    async () => {
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
            onSubmit={async () => {
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
            <Button type="submit" form="payment" className="w-full">
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
  onSubmit(info: any): void
}

export function Setup({ onSubmit }: SetupProps) {
  const storageService = useStorageService()
  const config = useConfig()
  const stripe = loadStripe(config.stripeApiKey, {})
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    const set = async () => {
      const secret = await storageService.getSetupIntent()
      setClientSecret(secret)
    }
    set()
  }, [storageService])

  if (!clientSecret) {
    return null
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
      }}
    >
      <PaymentForm onSubmit={onSubmit} />
    </Elements>
  )
}

export function PaymentForm({ onSubmit }: SetupProps) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      console.error(error)
    } else {
      await stripe.retrieveSetupIntent(setupIntent.client_secret!)
      onSubmit({})
    }
  }
  return (
    <form onSubmit={handleSubmit} id="payment">
      <PaymentElement />
    </form>
  )
}
