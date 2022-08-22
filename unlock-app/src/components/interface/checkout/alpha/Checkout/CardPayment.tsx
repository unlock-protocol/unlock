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
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Progress'

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
  const { paywallConfig, skipQuantity } = state.context

  const card = data?.[0]

  return (
    <Fragment>
      <Stepper
        position={4}
        service={checkoutService}
        items={[
          {
            id: 1,
            name: 'Select lock',
            to: 'SELECT',
          },
          {
            id: 2,
            name: 'Choose quantity',
            skip: skipQuantity,
            to: 'QUANTITY',
          },
          {
            id: 3,
            name: 'Add recipients',
            to: 'METADATA',
          },
          {
            id: 4,
            name: 'Choose payment',
            to: 'PAYMENT',
          },
          {
            id: 5,
            name: 'Sign message',
            skip: !paywallConfig.messageToSign,
            to: 'MESSAGE_TO_SIGN',
          },
          {
            id: 6,
            name: 'Solve captcha',
            to: 'CAPTCHA',
            skip: !paywallConfig.captcha,
          },
          {
            id: 7,
            name: 'Confirm',
            to: 'CONFIRM',
          },
          {
            id: 8,
            name: 'Minting NFT',
          },
        ]}
      />
      <main className="h-full px-6 py-2 overflow-auto">
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
      <footer className="grid items-center px-6 pt-6 border-t">
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
      <div className="pt-2 space-y-1">
        <label className="pl-1 text-sm" htmlFor="card-element">
          Country
        </label>
        <select
          autoComplete="country"
          defaultValue="United States"
          {...register('address_country', {
            required: true,
          })}
          className="block w-full text-sm border border-gray-400 rounded-lg hover:border-gray-500"
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
