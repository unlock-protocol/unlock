import React from 'react'
import { connect } from 'react-redux'
import { confirmKeyPurchase } from '../../../actions/user'
import {
  Grid,
  Item,
  ItemValue,
  SectionHeader,
  SubmitButton,
  LockInfo,
} from './styles'

interface KeyPurchaseConfirmationProps {
  emailAddress: string
  confirmKeyPurchase: () => any
}

// TODO: get credit card in state, pass in here for use
// TODO: get lock information, use in here
export const KeyPurchaseConfirmation = ({
  emailAddress,
  confirmKeyPurchase,
}: KeyPurchaseConfirmationProps) => (
  <Grid>
    <SectionHeader>Confirm Purchase</SectionHeader>
    <Item title="Account" size="full">
      <ItemValue>{emailAddress}</ItemValue>
    </Item>
    <Item title="Credit Card" size="full">
      <ItemValue>Visa ending in 5869</ItemValue>
    </Item>
    <LockInfo price="$17.19" timeRemaining="30 Days" />
    <SubmitButton onClick={confirmKeyPurchase} roundBottomOnly>
      Confirm Purchase
    </SubmitButton>
  </Grid>
)

export const mapDispatchToProps = (dispatch: any) => ({
  confirmKeyPurchase: () => dispatch(confirmKeyPurchase()),
})

interface ReduxState {
  account: {
    emailAddress?: string
  }
}
export const mapStateToProps = (state: ReduxState) => ({
  emailAddress: state.account.emailAddress || '',
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KeyPurchaseConfirmation)
