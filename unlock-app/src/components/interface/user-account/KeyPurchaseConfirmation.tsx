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
} from './styles'
import { Fees } from '../../../actions/keyPurchase'

interface KeyPurchaseConfirmationProps {
  address: string
  emailAddress: string
  lock?: Lock
  cards: stripe.Card[]
  priceBreakdown: { [name: string]: string }
  signPurchaseData: (d: PurchaseData) => any
}

// TODO: get credit card in state, pass in here for use
// TODO: get lock information, use in here
export const KeyPurchaseConfirmation = ({
  address,
  emailAddress,
  lock,
  cards,
  signPurchaseData,
  priceBreakdown,
}: KeyPurchaseConfirmationProps) => {
  const data: PurchaseData = {
    recipient: address,
    lock: (lock && lock.address) || '',
  }
  const timeRemaining = (
    <Duration seconds={(lock && lock.expirationDuration) || null} round />
  )
  let card = '-'
  if (cards.length) {
    const { brand, last4 } = cards[0]
    card = `${brand} ending in ${last4}`
  }

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
          {presentLock(priceBreakdown.total, timeRemaining)}
        </LockInfoWrapper>
      </Indent>
      {!!lock && (
        <Submit onClick={() => signPurchaseData(data)} roundBottomOnly>
          Confirm Purchase
        </Submit>
      )}
      {!lock && <Disabled roundBottomOnly>No lock found</Disabled>}
    </KeyPurchaseWrapper>
  )
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
  const { account, cart } = state
  let priceBreakdown = {}
  if (cart.fees) {
    priceBreakdown = makePriceBreakdown(cart.fees)
  }
  return {
    emailAddress: account.emailAddress || '',
    address: account.address || '',
    lock: cart.lock || undefined,
    cards: account.cards || [],
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
const Submit = styled(SubmitButton)`
  margin: 0;
`

const Disabled = styled(DisabledButton)`
  margin: 0;
`
