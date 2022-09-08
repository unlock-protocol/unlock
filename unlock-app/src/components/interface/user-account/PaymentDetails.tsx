import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { loadStripe, StripeCardElementOptions } from '@stripe/stripe-js'
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import configure from '../../../config'
import { countries } from '../../../utils/countries'
import { Button, Input } from '@unlock-protocol/ui'

interface PaymentDetailsProps {
  saveCard: (stripeToken: string, card: any, data: any) => any
  onCancel?: () => any
  renderChildren?: (props: any) => React.ReactNode
  renderError?: (props: any) => React.ReactNode
  buttonLabel?: string
}

export const PaymentDetails = ({
  saveCard,
  onCancel,
  renderChildren,
  renderError,
  buttonLabel,
}: PaymentDetailsProps) => {
  const { stripeApiKey } = configure()
  const stripePromise = loadStripe(stripeApiKey, {})

  return (
    <Elements stripe={stripePromise}>
      <Form
        onCancel={onCancel}
        saveCard={saveCard}
        renderChildren={renderChildren}
        renderError={renderError}
        buttonLabel={buttonLabel}
      />
    </Elements>
  )
}

PaymentDetails.defaultProps = {
  onCancel: null,
  renderChildren: null,
  renderError: null,
  buttonLabel: 'submit',
}

const cardElementOptions: StripeCardElementOptions = {
  classes: {
    base: 'checkout-details',
  },
}

interface FormProps {
  saveCard: (stripeToken: string, card: any, data: any) => any
  onCancel?: () => any
  renderChildren?: (props: any) => React.ReactNode
  renderError?: (props: any) => React.ReactNode
  buttonLabel?: string
}

export const Form = ({
  saveCard,
  onCancel,
  renderChildren,
  renderError,
  buttonLabel,
}: FormProps) => {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm()
  const stripe = useStripe()
  const elements = useElements()

  const onSubmit = async (data: Record<string, any>) => {
    setLoading(true)
    const cardElement = elements!.getElement(CardElement)
    const result = await stripe!.createToken(cardElement!, {
      address_country: data.address_country,
      name: data.name,
    })
    if (result.token) {
      await saveCard(result.token.id, result.token.card, data)
    }
    setLoading(false)
  }

  return (
    <form className="w-1/2 mx-auto" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <Input label="Name" {...register('name', { required: true })}></Input>
        <span className="text-sm">Credit Card Details</span>
        <CardElement options={cardElementOptions} />
        <span className="text-sm">Country</span>
        <select
          name="address_country"
          className="box-border flex-1 block w-full text-base transition-all border border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
          defaultValue="United States"
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      <div className="my-4">
        {renderChildren && renderChildren({ register })}
      </div>
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={!stripe || loading}>
          {loading ? 'Saving' : buttonLabel}
        </Button>
        {renderError && (
          <p className="text-xs text-red-500">{renderError({})}</p>
        )}
        {true && (
          <Button variant="outlined-primary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

Form.defaultProps = {
  onCancel: null,
  renderChildren: null,
  renderError: null,
  buttonLabel: 'submit',
}
