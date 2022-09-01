import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { loadStripe, StripeCardElementOptions } from '@stripe/stripe-js'
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import {
  Input,
  Label,
  Select,
  LoadingButton,
  NeutralButton,
} from '../checkout/FormStyles'
import configure from '../../../config'
import { countries } from '../../../utils/countries'

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label>Name</Label>
      <Input {...register('name', { required: true })} />
      <Label>Credit Card Details</Label>
      <CardElement options={cardElementOptions} />
      <Label>Country</Label>
      <Select name="address_country" defaultValue="United States">
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </Select>
      {renderChildren && renderChildren({ register })}
      {loading && <LoadingButton>Saving</LoadingButton>}
      {!loading && (
        <button
          className="bg-[#74ce63] text-white flex justify-center w-full px-4 py-3 font-medium rounded hover:bg-[#59c245]"
          type="submit"
          disabled={!stripe}
        >
          {buttonLabel}
        </button>
      )}
      {renderError && <p className="text-xs text-red-500">{renderError({})}</p>}
      {onCancel && <NeutralButton onClick={onCancel}>Cancel</NeutralButton>}
    </form>
  )
}

Form.defaultProps = {
  onCancel: null,
  renderChildren: null,
  renderError: null,
  buttonLabel: 'submit',
}
