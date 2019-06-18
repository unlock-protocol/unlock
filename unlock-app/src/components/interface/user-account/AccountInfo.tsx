import React from 'react'
import { connect } from 'react-redux'
import { Item, SectionHeader, ItemValue, Grid } from './styles'

interface Props {
  address: string
  emailAddress: string
}

export const AccountInfo = ({ address, emailAddress }: Props) => (
  <Grid>
    <SectionHeader>Account</SectionHeader>
    <Item title="Email" size="half">
      <ItemValue>{emailAddress}</ItemValue>
    </Item>
    <Item title="Wallet Address" size="half">
      <ItemValue>{address}</ItemValue>
    </Item>
  </Grid>
)

interface ReduxState {
  account: {
    address?: string
    emailAddress?: string
  }
}

export const mapStateToProps = ({ account }: ReduxState) => {
  let address = ''
  let emailAddress = ''
  // Default values for server-side rendering
  if (account) {
    address = account.address || address
    emailAddress = account.emailAddress || emailAddress
  }
  return {
    address,
    emailAddress,
  }
}

export default connect(mapStateToProps)(AccountInfo)
