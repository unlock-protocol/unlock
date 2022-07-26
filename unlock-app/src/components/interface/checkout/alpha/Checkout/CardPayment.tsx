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
import { useState } from 'react'
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
import { CheckoutHead, CloseButton } from '../Shell'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { ProgressCircleIcon, ProgressFinishedIcon } from '../Progress'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

export function CardPayment({
  checkoutService,
  injectedProvider,
  onClose,
}: Props) {
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
  const { title, description, iconURL } =
    useCheckoutHeadContent(checkoutService)
  const { paywallConfig } = state.context
  const { messageToSign } = paywallConfig
  const card = data?.[0]

  return (
    <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[80vh]">
      <div className="flex items-center justify-end mt-4 mx-4">
        <CloseButton onClick={() => onClose()} />
      </div>
      <CheckoutHead
        title={paywallConfig.title}
        iconURL={iconURL}
        description={description}
      />
      <div className="flex px-6 mt-6 flex-wrap items-center w-full gap-2">
        <div className="flex items-center gap-2 col-span-4">
          <button
            aria-label="back"
            onClick={(event) => {
              event.preventDefault()
              send('BACK')
            }}
            className="p-2 w-16 bg-brand-ui-primary inline-flex items-center justify-center rounded-full"
          >
            <div className="p-0.5 w-12 bg-white rounded-full"></div>
          </button>
          <h4 className="text-sm "> {title}</h4>
        </div>
        <div className="border-t-4 w-full flex-1"></div>
        <div className="inline-flex items-center gap-0.5">
          <ProgressCircleIcon disabled />
          {messageToSign && <ProgressCircleIcon disabled />}
          <ProgressCircleIcon disabled />
          <ProgressFinishedIcon disabled />
        </div>
      </div>
      <main className="p-6 overflow-auto h-full">
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
    </div>
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
