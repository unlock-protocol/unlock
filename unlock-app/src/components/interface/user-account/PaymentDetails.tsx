/* eslint react/display-name: 0 */
import React from 'react'
import {
  ReactStripeElements,
  StripeProvider,
  Elements,
  CardElement,
  injectStripe,
} from 'react-stripe-elements'
import { SectionHeader, Column, Grid, SubmitButton } from './styles'

interface PaymentDetailsProps {
  stripe: any
  emailAddress: string
}

export const PaymentDetails = React.memo(
  ({ stripe, emailAddress }: PaymentDetailsProps) => {
    const Form = injectStripe(PaymentForm)
    return (
      <StripeProvider stripe={stripe}>
        <Elements>
          <Form emailAddress={emailAddress} />
        </Elements>
      </StripeProvider>
    )
  }
)

interface PaymentFormProps {
  emailAddress: string
}

export class PaymentForm extends React.Component<
  PaymentFormProps & ReactStripeElements.InjectedStripeProps
> {
  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const { stripe, emailAddress } = this.props
    if (stripe) {
      const result = await stripe.createToken({
        name: emailAddress,
      })

      if (result.error) {
        console.log(result.error)
      } else if (result.token) {
        console.log(result.token)
      }
    }
  }

  render() {
    return (
      <Grid>
        <SectionHeader>Card Details</SectionHeader>
        <Column size="full">
          <CardElement />
        </Column>
        <Column size="half">
          <SubmitButton onClick={this.handleSubmit}>
            Add Payment Method
          </SubmitButton>
        </Column>
      </Grid>
    )
  }
}

export default PaymentDetails
