import React from 'react'
import { connect } from 'react-redux'
import { confirmKeyPurchase } from '../../../actions/user'
import {
  Column,
  Item,
  ItemValue,
  Section,
  SectionHeader,
  FullWidthButton,
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
  <React.Fragment>
    <SectionHeader>Confirm Purchase</SectionHeader>
    <Section>
      <Column>
        <Item title="Account">
          <ItemValue>{emailAddress}</ItemValue>
        </Item>
        <Item title="Credit Card">
          <ItemValue>Visa ending in 5869</ItemValue>
        </Item>
        <LockInfo price="$17.19" timeRemaining="30 Days" />
        <FullWidthButton onClick={confirmKeyPurchase}>
          Confirm Purchase
        </FullWidthButton>
      </Column>
    </Section>
  </React.Fragment>
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
