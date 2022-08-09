import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from 'react-query'
import {
  deleteCardForAddress,
  getCardsForAddress,
  saveCardsForAddress,
} from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { Button, Input } from '@unlock-protocol/ui'
import { useWalletService } from '~/utils/withWalletService'
import { Fragment, useState } from 'react'
import { Card, CardPlaceholder } from '../Card'
import { FieldValues, useForm } from 'react-hook-form'
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { countries } from '~/utils/countries'
import { loadStripe } from '@stripe/stripe-js'
import { useActor } from '@xstate/react'
import {
  BackButton,
  CheckoutHead,
  CheckoutTransition,
  CloseButton,
} from '../Shell'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { ProgressCircleIcon, ProgressFinishedIcon } from '../Progress'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function CardPayment({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { account } = useAuth()
  const [editCard, setEditCard] = useState(false)
  const config = useConfig()
  const stripe = loadStripe(config.stripeApiKey, {})
  const walletService = useWalletService()
  const [isSaving, setIsSaving] = useState(false)
  const { isLoading, data, refetch } = useQuery(
    ['cards', account],
    () => getCardsForAddress(config, walletService, account!),
    {
      staleTime: Infinity,
      enabled: !!account,
    }
  )
  const { paywallConfig } = state.context
  const { messageToSign } = paywallConfig
  const card = data?.[0]

  return (
    <Fragment>
      <div className="flex px-6 p-2 flex-wrap items-center w-full gap-2">
        <div className="flex items-center gap-2 col-span-4">
          <button
            aria-label="back"
            onClick={(event) => {
              event.preventDefault()
              send('BACK')
            }}
            className="p-2 w-20 bg-brand-ui-primary inline-flex items-center justify-center rounded-full"
          >
            <div className="p-0.5 w-16 bg-white rounded-full"></div>
          </button>
          <h4 className="text-sm"> Add card </h4>
        </div>
        <div className="border-t-4 w-full flex-1"></div>
        <div className="inline-flex items-center gap-0.5">
          {messageToSign && <ProgressCircleIcon disabled />}
          <ProgressCircleIcon disabled />
          <ProgressFinishedIcon disabled />
        </div>
      </div>
      <main className="px-6 py-2 overflow-auto h-full">
        <Elements stripe={stripe}>
          {isLoading ? (
            <CardPlaceholder />
          ) : editCard || !card ? (
            <CardForm
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              onSave={async () => {
                await refetch()
                setIsSaving(false)
                setEditCard(false)
              }}
            />
          ) : (
            <Card onChange={() => setEditCard(true)} {...card} />
          )}
        </Elements>
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          {editCard || !card ? (
            <Button
              disabled={isSaving || isLoading}
              loading={isSaving}
              type="submit"
              form="card-save"
              className="w-full"
            >
              {isSaving ? 'Saving' : 'Save'}
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={!card || isLoading}
              onClick={() => {
                send({
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

interface CardFormProps {
  isSaving: boolean
  setIsSaving(value: boolean): void
  onSave(): void
}

function CardForm({ onSave, setIsSaving }: CardFormProps) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm()
  const stripe = useStripe()
  const elements = useElements()
  const { account } = useAuth()
  const config = useConfig()
  const walletService = useWalletService()

  const onSubmit = async (data: FieldValues) => {
    setIsSaving(true)
    const cardElement = elements!.getElement(CardElement)
    const result = await stripe!.createToken(cardElement!, {
      address_country: data.address_country,
      name: data.name,
    })
    if (result.token && account) {
      deleteCardForAddress(config, walletService, account)
      await saveCardsForAddress(config, walletService, account, result.token.id)
    }
    onSave()
  }

  let errorMessage = ''
  if (errors?.name?.message) {
    errorMessage = errors.name.message as unknown as string
  }

  return (
    <form
      id="card-save"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-2"
    >
      <Input
        error={errorMessage}
        size="small"
        label="Name"
        autoComplete="name"
        description="Please use the name on your card"
        {...register('name')}
      />
      <div className="space-y-1">
        <label className="pl-1 text-sm" htmlFor="card-element">
          Card
        </label>
        <CardElement id="card-element" />
      </div>
      <div className="space-y-1 pt-2">
        <label className="pl-1 text-sm" htmlFor="card-element">
          Country
        </label>
        <select
          autoComplete="country"
          defaultValue="United States"
          {...register('address_country', {
            required: true,
          })}
          className="block border hover:border-gray-500 border-gray-400 text-sm w-full rounded-lg"
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
    </form>
  )
}
