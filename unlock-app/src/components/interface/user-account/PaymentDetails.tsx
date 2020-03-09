/* eslint react/display-name: 0 */
import React from 'react'
import { connect } from 'react-redux'
import {
  Elements,
  ElementsConsumer,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js'
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
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
import configure from '../../../config'

interface PaymentDetailsProps {
  signPaymentData: (stripeTokenId: string) => any
  close: (e: WarningError) => void
  errors: WarningError[]
}

interface PaymentFormProps {
  signPaymentData: (stripeTokenId: string) => any
  close: (e: WarningError) => void
  errors: WarningError[]
  stripe: Stripe | null
  elements: StripeElements | null
}

interface PaymentFormState {
  cardHolderName: string
  addressCountry: string
  addressZip: string
  submitted: boolean
}

const { stripeApiKey } = configure()
const stripePromise = loadStripe(stripeApiKey)

export const PaymentDetails = ({
  signPaymentData,
  close,
  errors,
}: PaymentDetailsProps) => {
  return (
    <Elements stripe={stripePromise}>
      <ElementsConsumer>
        {({ stripe, elements }) => (
          <PaymentForm
            stripe={stripe}
            elements={elements}
            signPaymentData={signPaymentData}
            close={close}
            errors={errors}
          />
        )}
      </ElementsConsumer>
    </Elements>
  )
}

export class PaymentForm extends React.Component<
  PaymentFormProps,
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

    const { elements, stripe, signPaymentData } = this.props
    const { addressCountry, addressZip, cardHolderName } = this.state

    this.setState({
      submitted: true,
    })

    if (stripe && elements) {
      const cardNumberElement = elements.getElement(CardNumberElement)
      const result = await stripe.createToken(cardNumberElement!, {
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
    }
    if (submitted) {
      return <LoadingButton>Submitting...</LoadingButton>
    }

    return (
      <SubmitButton onClick={this.handleSubmit}>
        Add Payment Method
      </SubmitButton>
    )
  }

  render() {
    const stripeElementOptions = {
      style: {
        base: { fontSize: '16px', lineHeight: '40px' },
      },
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
            <CardNumberElement options={stripeElementOptions} />
          </Item>
          <CardContainer>
            <div>
              <ItemLabel>Expiry Date</ItemLabel>
              <CardExpiryElement options={stripeElementOptions} />
            </div>
            <div>
              <ItemLabel>CVC Number</ItemLabel>
              <CardCvcElement options={stripeElementOptions} />
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

export default connect(mapStateToProps, mapDispatchToProps)(PaymentDetails)
