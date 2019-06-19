import React from 'react'
import withConfig from '../../../utils/withConfig'
import { ReactStripeElements, StripeProvider, Elements, CardElement, injectStripe } from 'react-stripe-elements'

interface PaymentDetailsProps {
  config: {
    stripeApiKey: string
  }
  emailAddress: string
}

export const PaymentDetails = ({ config, emailAddress }: PaymentDetailsProps) => {
  const Form = injectStripe(PaymentForm)
  return (
    <StripeProvider apiKey={config.stripeApiKey}>
      <Elements>
        <Form emailAddress={emailAddress} />
      </Elements>
    </StripeProvider>
  )
}

interface PaymentFormProps {
  emailAddress: string
}

export class PaymentForm extends React.Component<
PaymentFormProps & ReactStripeElements.InjectedStripeProps
> {
  async handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const { stripe, emailAddress } = this.props
    if (stripe) {
      const result = await stripe.createPaymentMethod('card', {
        billing_details: {
          email: emailAddress,
        },
      })

      if (result.error) {
        console.log(result.error)
      } else if (result.paymentMethod) {
        console.log(result.paymentMethod)
      }
    }
  }
  
  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Card details
          <CardElement />
        </label>
      </form>
    )
  }
}

export default withConfig(PaymentDetails)
