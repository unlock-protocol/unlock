import React from 'react'
import { connect } from 'react-redux'
import { Item, Section, SectionHeader, ItemValue } from './styles'

interface Props {
  address: string
  email: string
}

export const AccountInfo = ({ address, email }: Props) => (
  <React.Fragment>
    <SectionHeader>Account</SectionHeader>
    <Section>
      <Item title="Email">
        <ItemValue>{email}</ItemValue>
      </Item>
      <Item title="Wallet Address">
        <ItemValue>{address}</ItemValue>
      </Item>
    </Section>
  </React.Fragment>
)

interface ReduxState {
  account?: {
    address: string
  }
  userDetails?: {
    email: string
  }
}

export const mapStateToProps = (state: ReduxState) => {
  const address = state.account ? state.account.address : ''
  const email = state.userDetails ? state.userDetails.email : ''
  return {
    address,
    email,
  }
}

export default connect(mapStateToProps)(AccountInfo)
