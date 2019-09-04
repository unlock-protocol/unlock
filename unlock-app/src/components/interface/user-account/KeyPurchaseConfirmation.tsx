import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { signPurchaseData, PurchaseData } from '../../../actions/user'
import Duration from '../../helpers/Duration'
import { Lock } from '../../../unlockTypes'
import {
  Grid,
  Item,
  ItemValue,
  SubmitButton,
  LockInfo,
  DisabledButton,
  LoadingButton,
} from './styles'
import { Fees } from '../../../actions/keyPurchase'

interface Props {
  address: string
  emailAddress: string
  lock?: Lock
  card: string
  priceBreakdown: { [name: string]: string }
  signPurchaseData: (d: PurchaseData) => any
}

interface State {
  sentKeyPurchase: boolean
}

export class KeyPurchaseConfirmation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      sentKeyPurchase: false,
    }
  }

  submitButton = () => {
    const { sentKeyPurchase } = this.state
    const { lock, address } = this.props

    if (sentKeyPurchase) {
      return (
        <LoadingButton roundBottomOnly>
          <span>Submitting Transaction...</span>
        </LoadingButton>
      )
    } else if (lock) {
      const data: PurchaseData = {
        recipient: address,
        lock: lock.address,
      }
      return (
        <SubmitButton onClick={() => this.handleSubmit(data)} roundBottomOnly>
          Confirm Purchase
        </SubmitButton>
      )
    }

    return <DisabledButton roundBottomOnly>No lock found</DisabledButton>
  }

  handleSubmit = (data: PurchaseData) => {
    const { signPurchaseData } = this.props

    signPurchaseData(data)

    this.setState({
      sentKeyPurchase: true,
    })
  }

  timeRemaining = () => {
    const { lock } = this.props
    return (
      <Duration seconds={(lock && lock.expirationDuration) || null} round />
    )
  }

  render = () => {
    const { emailAddress, card, priceBreakdown } = this.props
    return (
      <KeyPurchaseWrapper>
        <Indent>
          <Heading>Confirm Purchase</Heading>
          <Item title="Account" size="full">
            <Value>{emailAddress}</Value>
          </Item>
          <Item title="Credit Card" size="full">
            <Value>{card}</Value>
          </Item>
          <LockInfoWrapper>
            {presentLock(priceBreakdown.total, this.timeRemaining())}
          </LockInfoWrapper>
        </Indent>
        {this.submitButton()}
      </KeyPurchaseWrapper>
    )
  }
}

const presentLock = (price: string, timeRemaining: any, none: string = '-') => {
  let displayedPrice = price || none
  return <LockInfo price={displayedPrice} timeRemaining={timeRemaining} />
}

const presentPrice = (price: number) => {
  var dollars = price / 100
  // TODO: localize (all values returned from Locksmith are in USD)
  return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export const mapDispatchToProps = (dispatch: any) => ({
  signPurchaseData: (d: PurchaseData) => dispatch(signPurchaseData(d)),
})

export const makePriceBreakdown = (fees: Fees): { [key: string]: string } => {
  const totalPrice = Object.values(fees).reduce((a, b) => a + b, 0)

  return {
    keyPrice: presentPrice(fees.keyPrice),
    gasFee: presentPrice(fees.gasFee),
    creditCardProcessing: presentPrice(fees.creditCardProcessing),
    unlockServiceFee: presentPrice(fees.unlockServiceFee),
    total: presentPrice(totalPrice),
  }
}

export const displayCard = (card: stripe.Card) => {
  const { brand, last4 } = card
  return `${brand} ending in ${last4}`
}

interface ReduxState {
  account: {
    emailAddress?: string
    address?: string
    cards?: stripe.Card[]
  }
  cart: {
    lock?: Lock
    fees?: Fees
  }
}
export const mapStateToProps = (state: ReduxState) => {
  const {
    account: { emailAddress, address, cards },
    cart,
  } = state

  let priceBreakdown = {}
  if (cart.fees) {
    priceBreakdown = makePriceBreakdown(cart.fees)
  }

  let card = '-'
  if (cards && cards.length) {
    card = displayCard(cards[0])
  }
  return {
    emailAddress: emailAddress || '',
    address: address || '',
    lock: cart.lock || undefined,
    card,
    priceBreakdown,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KeyPurchaseConfirmation)

const KeyPurchaseWrapper = styled(Grid)`
  max-width: 456px;
  padding: 0;
  padding-top: 24px;
`

const Indent = styled.div`
  padding: 0 32px;
`

const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 15px;
  line-height: 15px;
  font-weight: bold;
  color: var(--darkgrey);
  padding-bottom: 24px;
  margin: 0;
`

const Value = styled(ItemValue)`
  margin: 0;
  margin-top: 24px;
  margin-bottom: 36px;
  margin-left: 8px;
`

const LockInfoWrapper = styled.div`
  margin-top: 8px;
`
