import React from 'react'
import { connect } from 'react-redux'
import { signPurchaseData, PurchaseData } from '../../../actions/user'
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
  signPurchaseData: (data: PurchaseData) => any
}

// TODO: get credit card in state, pass in here for use
// TODO: get lock information, use in here
export const KeyPurchaseConfirmation = ({
  emailAddress,
  signPurchaseData,
}: KeyPurchaseConfirmationProps) => {
  const data: PurchaseData = {
    recipient: '',
    lock: '',
  }
  return (
    <Grid>
      <SectionHeader>Confirm Purchase</SectionHeader>
      <Item title="Account" size="full">
        <ItemValue>{emailAddress}</ItemValue>
      </Item>
      <Item title="Credit Card" size="full">
        <ItemValue>Visa ending in 5869</ItemValue>
      </Item>
      <LockInfo price="$17.19" timeRemaining="30 Days" />
      <SubmitButton onClick={() => signPurchaseData(data)} roundBottomOnly>
        Confirm Purchase
      </SubmitButton>
    </Grid>
  )
}

export const mapDispatchToProps = (dispatch: any) => ({
  signPurchaseData: (data: PurchaseData) => dispatch(signPurchaseData(data)),
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
