/* eslint react/display-name: 0 */
import React from 'react'
import { connect } from 'react-redux'
import {
  ReactStripeElements,
  StripeProvider,
  Elements,
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
} from 'react-stripe-elements'
import {
  Item,
  ItemLabel,
  CardContainer,
  Input,
  SectionHeader,
  Column,
  Grid,
  SubmitButton,
} from './styles'
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
    const stripeElementStyles = {
      base: { fontSize: '16px', lineHeight: '40px' },
    }
    return (
      <Grid>
        <SectionHeader>Card Details</SectionHeader>
        <div>
          <ItemLabel>Cardholder Name</ItemLabel>
          <Input
            name="cardHolderName"
            id="cardHolderName"
            type="text"
            placeholder="Cardholder Name"
            onChange={this.handleInputChange}
          />
        </div>
        <div>
          <ItemLabel>Address Line 1</ItemLabel>
          <Input
            name="address1"
            id="address1"
            type="text"
            placeholder="Address Line 1"
            onChange={this.handleInputChange}
          />
        </div>
        <div>
          <ItemLabel>Address Line 2</ItemLabel>
          <Input
            name="address2"
            id="address2"
            type="text"
            placeholder="Address Line 2"
            onChange={this.handleInputChange}
          />
        </div>
        <CardContainer>
          <div>
            <ItemLabel>City</ItemLabel>
            <Input
              name="addressCity"
              id="addressCity"
              type="text"
              placeholder="City"
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <ItemLabel>State</ItemLabel>
            <Input
              name="addressState"
              id="addressState"
              type="text"
              placeholder="State"
              onChange={this.handleInputChange}
            />
          </div>
        </CardContainer>
        <div>
          <ItemLabel>Country</ItemLabel>
          <Input
            name="addressCountry"
            id="addressCountry"
            type="country"
            placeholder="Country"
            onChange={this.handleInputChange}
          />
        </div>
        <Column size="full">
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
