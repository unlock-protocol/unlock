import React from 'react'
import { connect } from 'react-redux'
import { Item, Section, SectionHeader, ItemValue } from './styles'

interface Props {
  address: string
  emailAddress: string
}

export const AccountInfo = ({ address, emailAddress }: Props) => (
  <React.Fragment>
    <SectionHeader>Account</SectionHeader>
    <Section>
      <Item title="Email">
        <ItemValue>{emailAddress}</ItemValue>
      </Item>
      <Item title="Wallet Address">
        <ItemValue>{address}</ItemValue>
      </Item>
    </Section>
  </React.Fragment>
)

interface ReduxState {
  account: {
    address?: string
    emailAddress?: string
  }
}

export const mapStateToProps = ({ account }: ReduxState) => {
  let { address, emailAddress } = account
  // Default values for server-side rendering
  address = address || ''
  emailAddress = emailAddress || ''
  return {
    address,
    emailAddress,
  }
}

export default connect(mapStateToProps)(AccountInfo)
