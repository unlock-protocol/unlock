import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { loadStripe } from '@stripe/stripe-js'
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import configure from '../../../config'
import { countries } from '../../../utils/countries'
import { useProvider } from '../../../hooks/useProvider'
import { StorageServiceContext } from '../../../utils/withStorageService'
import { StorageService } from '../../../services/storageService'

const { stripeApiKey } = configure()
const stripePromise = loadStripe(stripeApiKey)

interface Props {
  invokePurchase: () => void
  setShowingPaymentForm: any
}

export const PaymentDetails = (props: Props) => {
  return (
    <Elements stripe={stripePromise}>
      <Form {...props} />
    </Elements>
  )
}

export const Form = ({ invokePurchase, setShowingPaymentForm }: Props) => {
  const { register, handleSubmit } = useForm()
  const stripe = useStripe()
  const elements = useElements()
  const { provider } = useProvider()
  const storageService: StorageService = useContext(StorageServiceContext)

  const onSubmit = async (data: Record<string, any>) => {
    const cardElement = elements!.getElement(CardElement)
    const result = await stripe!.createToken(cardElement!, {
      address_country: data.address_country,
      name: data.name,
    })

    if (result.token) {
      const { data, sig } = provider!.signPaymentData(result.token.id)
      await storageService.addPaymentMethod(
        data.message.user.emailAddress,
        data,
        sig
      )

      // In some cases this will trigger the metadata form, which will
      // cause a state update on an unmounted component. There will be an
      // error in the console, but it shouldn't cause any issues.
      invokePurchase()
      setShowingPaymentForm({ visible: false })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="name" ref={register({ required: true })} />
      <CardElement />
      <select name="address_country" defaultValue="United States">
        {countries.map(country => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <button type="submit" disabled={!stripe}>
        Submit
      </button>
    </form>
  )
}
