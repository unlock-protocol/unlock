import React, { useContext } from 'react'
import { Item, SectionHeader, ItemValue, Grid } from './styles'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

export const AccountInfo = () => {
  const { account, email } = useContext(AuthenticationContext)

  return (
    <Grid>
      <SectionHeader>Account</SectionHeader>
      {email && (
        <Item title="Email" count="half">
          <ItemValue>{email}</ItemValue>
        </Item>
      )}
      <Item title="Wallet Address" count="half">
        <ItemValue>{account}</ItemValue>
      </Item>
    </Grid>
  )
}
export default AccountInfo
