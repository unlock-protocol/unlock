import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { loadStripe, StripeCardElementOptions } from '@stripe/stripe-js'
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import styled from 'styled-components'
import { Input, Label, Select, Button } from '../checkout/FormStyles'
import { SectionHeader } from './styles'
import configure from '../../../config'
import { countries } from '../../../utils/countries'
import { useProvider } from '../../../hooks/useProvider'
import { StorageServiceContext } from '../../../utils/withStorageService'
import { StorageService } from '../../../services/storageService'

const { stripeApiKey } = configure()
const stripePromise = loadStripe(stripeApiKey)

export const PaymentDetails = () => {
  return (
    <Elements stripe={stripePromise}>
      <Form />
    </Elements>
  )
}

const cardElementOptions: StripeCardElementOptions = {
  classes: {
    base: 'checkout-details',
  },
}

export const Form = () => {
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
    }
  }

  return (
    <>
      <SectionHeader>Add a Payment Method</SectionHeader>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <Label>Name</Label>
        <Input name="name" ref={register({ required: true })} />
        <Label>Credit Card Details</Label>
        <CardElement options={cardElementOptions} />
        <Label>Country</Label>
        <Select name="address_country" defaultValue="United States">
          {countries.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={!stripe}>
          Submit
        </Button>
      </StyledForm>
    </>
  )
}

const StyledForm = styled.form`
  max-width: 50%;
`
