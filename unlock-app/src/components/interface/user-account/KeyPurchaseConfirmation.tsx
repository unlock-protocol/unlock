import React from 'react'
import { connect } from 'react-redux'
import { signPurchaseData, PurchaseData } from '../../../actions/user'
import Duration from '../../helpers/Duration'
import { Lock } from '../../../unlockTypes'
import {
  Grid,
  Item,
  ItemValue,
  SectionHeader,
  SubmitButton,
  LockInfo,
  DisabledButton,
} from './styles'

interface KeyPurchaseConfirmationProps {
  address: string
  emailAddress: string
  lock?: Lock
  signPurchaseData: (d: PurchaseData) => any
}

// TODO: get credit card in state, pass in here for use
// TODO: get lock information, use in here
export const KeyPurchaseConfirmation = ({
  address,
  emailAddress,
  lock,
  signPurchaseData,
}: KeyPurchaseConfirmationProps) => {
  const data: PurchaseData = {
    recipient: address,
    lock: (lock && lock.address) || '',
  }
  const timeRemaining = (
    <Duration seconds={(lock && lock.expirationDuration) || null} round />
  )
  return (
    <Grid>
      <SectionHeader>Confirm Purchase</SectionHeader>
      <Item title="Account" size="full">
        <ItemValue>{emailAddress}</ItemValue>
      </Item>
      <Item title="Credit Card" size="full">
        <ItemValue>Visa ending in 5869</ItemValue>
      </Item>
      <LockInfo price="$17.19" timeRemaining={timeRemaining} />
      {!!lock && (
        <SubmitButton onClick={() => signPurchaseData(data)} roundBottomOnly>
          Confirm Purchase
        </SubmitButton>
      )}
      {!lock && <DisabledButton roundBottomOnly>No lock found</DisabledButton>}
    </Grid>
  )
}

export const mapDispatchToProps = (dispatch: any) => ({
  signPurchaseData: (d: PurchaseData) => dispatch(signPurchaseData(d)),
})

interface ReduxState {
  account: {
    emailAddress?: string
    address?: string
  }
  cart: {
    lock?: Lock
  }
}
export const mapStateToProps = (state: ReduxState) => ({
  emailAddress: state.account.emailAddress || '',
  address: state.account.address || '',
  lock: state.cart.lock || undefined,
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KeyPurchaseConfirmation)
