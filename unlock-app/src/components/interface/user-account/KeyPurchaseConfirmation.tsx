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

interface KeyPurchaseConfirmationProps {
  address: string
  emailAddress: string
  lock?: Lock
  cards: stripe.Card[]
  price?: number
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
  price,
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
        <LockInfoWrapper>{presentLock(price, timeRemaining)}</LockInfoWrapper>
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

const presentLock = (price: any, timeRemaining: any) => {
  let displayedPrice = price ? presentPrice(price) : '-'
  return <LockInfo price={displayedPrice} timeRemaining={timeRemaining} />
}

const presentPrice = (price: number) => {
  var dollars = price / 100
  return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export const mapDispatchToProps = (dispatch: any) => ({
  signPurchaseData: (d: PurchaseData) => dispatch(signPurchaseData(d)),
})

interface ReduxState {
  account: {
    emailAddress?: string
    address?: string
    cards?: stripe.Card[]
  }
  cart: {
    lock?: Lock
    price?: number
  }
}
export const mapStateToProps = (state: ReduxState) => {
  const { account, cart } = state
  return {
    emailAddress: account.emailAddress || '',
    address: account.address || '',
    lock: cart.lock || undefined,
    cards: account.cards || [],
    price: cart.price,
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
