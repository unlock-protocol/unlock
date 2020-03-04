/* eslint react/display-name: 0 */
import React, { useState } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { useForm } from 'react-hook-form'
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Input, SubmitButton, LoadingButton, FormSubmitButton } from './styles'
import configure from '../../../config'
import { signPaymentData } from '../../../actions/user'
import { UnlockError, isWarningError, WarningError } from '../../../utils/Error'
import { resetError } from '../../../actions/error'

interface PaymentDetailsProps {
  signPaymentData: (stripeTokenId: string) => any
  close: (e: WarningError) => void
  errors: WarningError[]
}

const { stripeApiKey } = configure()
const stripePromise = loadStripe(stripeApiKey)

export const PaymentDetails = ({ signPaymentData }: PaymentDetailsProps) => {
  return (
    <Elements stripe={stripePromise}>
      <Form signPaymentData={signPaymentData} />
    </Elements>
  )
}

export const getSubmitButton = (submitted: boolean) => {
  if (submitted) {
    return <LoadingButton>Submitting...</LoadingButton>
  }

  return (
    <FormSubmitButton type="submit" value="Submit" />
  )
}

interface FormProps {
  signPaymentData: (stripeTokenId: string) => any
}

export const Form = ({ signPaymentData }: FormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit } = useForm()
  const onSubmit = async (data: any) => {
    setSubmitted(true)
    const cardElement = elements!.getElement(CardElement)
    const result = await stripe!.createToken(cardElement!, {
      name: data['Cardholder Name'],
    })

    if (result.token) {
      signPaymentData(result.token.id)
    }
  }

  console.log({
    stripe,
    elements
  })

  const stripeElementOptions = {
    style: {
      base: {
        fontFamily: 'IBM Plex Sans, sans-serif',
        fontSize: '16px',
        lineHeight: '60px',
      },
    },
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input type="text" placeholder="Cardholder Name" name="Cardholder Name" ref={register({required: true})} />
      <CardContainer>
        <CardElement options={stripeElementOptions} />
      </CardContainer>
      
      {getSubmitButton(submitted)}
    </form>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  signPaymentData: (stripeTokenId: string) =>
    dispatch(signPaymentData(stripeTokenId)),
  close: (e: WarningError) => {
    dispatch(resetError(e))
  },
})

interface ReduxState {
  account?: Account
  errors: UnlockError[]
}

const mapStateToProps = ({ account, errors }: ReduxState) => {
  const storageWarnings = errors.filter(
    e => isWarningError(e) && e.kind === 'Storage'
  )

  return {
    account,
    errors: storageWarnings as WarningError[],
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentDetails)

export const CardContainer = styled.div`
    background-color: var(--lightgrey);
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 4px;
    margin-bottom: 1rem;
`
