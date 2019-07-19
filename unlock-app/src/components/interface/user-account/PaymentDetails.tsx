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
  PaddedGrid,
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
  addressCountry: string
  addressZip: string
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
      addressCountry: '',
      addressZip: '',
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
    const { addressCountry, addressZip, cardHolderName } = this.state
    if (stripe) {
      const result = await stripe.createToken({
        address_country: addressCountry,
        address_zip: addressZip,
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
      <PaddedGrid>
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
        <CardContainer>
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
          <div>
            <ItemLabel>Zip / Postal Code</ItemLabel>
            <Input
              name="addressZip"
              id="addressZip"
              type="text"
              placeholder="Zip Code"
              onChange={this.handleInputChange}
            />
          </div>
        </CardContainer>
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
      </PaddedGrid>
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
