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
  LoadingButton,
} from './styles'
import { signPaymentData } from '../../../actions/user'
import { UnlockError, isWarningError, WarningError } from '../../../utils/Error'
import { resetError } from '../../../actions/error'

interface PaymentDetailsProps {
  stripe: stripe.Stripe | null
  signPaymentData: (stripeTokenId: string) => any
  close: (e: WarningError) => void
  errors: WarningError[]
}

interface PaymentFormProps {
  signPaymentData: (stripeTokenId: string) => any
  close: (e: WarningError) => void
  errors: WarningError[]
}

interface PaymentFormState {
  cardHolderName: string
  addressCountry: string
  addressZip: string
  submitted: boolean
}

// Memoized because it would constantly rerender (which cleared the Stripe form)
// because it couldn't tell the props were the same
export const PaymentDetails = React.memo(
  ({ stripe, signPaymentData, close, errors }: PaymentDetailsProps) => {
    const Form = injectStripe(PaymentForm)
    return (
      <StripeProvider stripe={stripe}>
        <Elements>
          <Form
            signPaymentData={signPaymentData}
            close={close}
            errors={errors}
          />
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
      submitted: false,
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

  handleSubmit = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault()
    }

    const { stripe, signPaymentData } = this.props
    const { addressCountry, addressZip, cardHolderName } = this.state

    this.setState({
      submitted: true,
    })

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

      if (result.error) {
        this.setState({
          submitted: false,
        })
      }
    }
  }

  handleReset = () => {
    const { errors, close } = this.props
    errors.forEach(e => close(e))
    this.handleSubmit()
  }

  submitButton = () => {
    const { errors } = this.props
    const { submitted } = this.state

    if (errors.length) {
      return (
        <SubmitButton backgroundColor="var(--red)" onClick={this.handleReset}>
          Clear Errors and Retry
        </SubmitButton>
      )
    } else if (submitted) {
      return <LoadingButton>Submitting...</LoadingButton>
    }

    return (
      <SubmitButton onClick={this.handleSubmit}>
        Add Payment Method
      </SubmitButton>
    )
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
        <Column size="half">{this.submitButton()}</Column>
      </Grid>
    )
  }
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentDetails)
