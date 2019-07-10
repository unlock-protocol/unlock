/* eslint react/display-name: 0 */
import React from 'react'
import { connect } from 'react-redux'
import {
  ReactStripeElements,
  StripeProvider,
  Elements,
  CardElement,
  injectStripe,
} from 'react-stripe-elements'
import { Input, SectionHeader, Column, Grid, SubmitButton } from './styles'
import { signPaymentData } from '../../../actions/user'

interface PaymentDetailsProps {
  stripe: stripe.Stripe | null
  signPaymentData: (stripeTokenId: string) => any
}

interface PaymentFormProps {
  signPaymentData: (stripeTokenId: string) => any
}

interface PaymentFormState {
  cardHolderName: string
  address1: string
  address2: string
  addressCity: string
  addressState: string
  addressCountry: string
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

export class PaymentForm extends React.Component<
  PaymentFormProps & ReactStripeElements.InjectedStripeProps,
  PaymentFormState
> {
  constructor(props: any) {
    super(props)
    this.state = {
      cardHolderName: '',
      address1: '',
      address2: '',
      addressCity: '',
      addressState: '',
      addressCountry: '',
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target

    this.setState(prevState => {
      const newState = {
        ...prevState,
        [name]: value,
      }

      return newState
    })
  }

  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const { stripe, signPaymentData } = this.props
    const {
      address1,
      address2,
      addressCity,
      addressState,
      addressCountry,
      cardHolderName,
    } = this.state
    if (stripe) {
      const result = await stripe.createToken({
        address_line1: address1,
        address_line2: address2,
        address_city: addressCity,
        address_state: addressState,
        address_country: addressCountry,
        name: cardHolderName,
      })

      // TODO: handle result.error case here
      if (result.token) {
        signPaymentData(result.token.id)
      }
    }
  }

  render() {
    return (
      <Grid>
        <SectionHeader>Card Details</SectionHeader>
        <Input
          name="cardHolderName"
          id="cardHolderName"
          type="text"
          placeholder="Card Holder Name"
          onChange={this.handleInputChange}
        />
        <Input
          name="address1"
          id="address1"
          type="text"
          placeholder="Address Line 1"
          onChange={this.handleInputChange}
        />
        <Input
          name="address2"
          id="address2"
          type="text"
          placeholder="Address Line 2"
          onChange={this.handleInputChange}
        />
        <Input
          name="addressCity"
          id="addressCity"
          type="text"
          placeholder="City"
          onChange={this.handleInputChange}
        />
        <Input
          name="addressState"
          id="addressState"
          type="text"
          placeholder="State"
          onChange={this.handleInputChange}
        />
        <Input
          name="addressCountry"
          id="addressCountry"
          type="country"
          placeholder="Country"
          onChange={this.handleInputChange}
        />
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

export const mapDispatchToProps = (dispatch: any) => ({
  signPaymentData: (stripeTokenId: string) =>
    dispatch(signPaymentData(stripeTokenId)),
})

export default connect(
  null,
  mapDispatchToProps
)(PaymentDetails)
