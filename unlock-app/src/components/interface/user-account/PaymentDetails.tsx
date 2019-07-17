/* eslint react/display-name: 0 */
import React from 'react'
import { connect } from 'react-redux'
import {
  ReactStripeElements,
  StripeProvider,
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  injectStripe,
} from 'react-stripe-elements'
import {
  Item,
  ItemLabel,
  SectionHeader,
  Column,
  Grid,
  SubmitButton,
  CardContainer,
} from './styles'
import { signPaymentData } from '../../../actions/user'

interface PaymentDetailsProps {
  stripe: stripe.Stripe | null
  signPaymentData: (stripeTokenId: string) => any
}

// Memoized because it would constantly rerender (which cleared the Stripe form)
// because it couldn't tell the props were the same
export const PaymentDetails = React.memo(
  ({ stripe, signPaymentData }: PaymentDetailsProps) => {
    const Form = injectStripe(PaymentForm)
    return (
      <StripeProvider stripe={stripe}>
        <Elements>
          <Form signPaymentData={signPaymentData} />
        </Elements>
      </StripeProvider>
    )
  }
)

interface PaymentFormProps {
  signPaymentData: (stripeTokenId: string) => any
}

export class PaymentForm extends React.Component<
  PaymentFormProps & ReactStripeElements.InjectedStripeProps
> {
  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const { stripe, signPaymentData } = this.props
    if (stripe) {
      const result = await stripe.createToken()

      // TODO: handle result.error case here
      if (result.token) {
        signPaymentData(result.token.id)
      }
    }
  }

  render() {
    const stripeElementStyles = {
      base: { fontSize: '16px', lineHeight: '40px' },
    }
    return (
      <Grid>
        <SectionHeader>Card Details</SectionHeader>
        <Column size="half">
          <Item title="Credit Card Number">
            <CardNumberElement style={stripeElementStyles} />
          </Item>
          <CardContainer>
            <div>
              <ItemLabel>Expiry Date</ItemLabel>
              <CardExpiryElement style={stripeElementStyles} />
            </div>
            <div>
              <ItemLabel>CVC Number</ItemLabel>
              <CardCVCElement style={stripeElementStyles} />
            </div>
          </CardContainer>
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

export const mapDispatchToProps = (dispatch: any) => ({
  signPaymentData: (stripeTokenId: string) =>
    dispatch(signPaymentData(stripeTokenId)),
})

export default connect(
  null,
  mapDispatchToProps
)(PaymentDetails)
