import React, { useContext } from 'react'
import { Item, SectionHeader, ItemValue, Grid } from './styles'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import useEns from '../../../hooks/useEns'

export const AccountInfo = () => {
  const { account, email } = useContext(AuthenticationContext)
  const name = useEns(account || '')

  return (
    <Grid>
      <SectionHeader>Account</SectionHeader>
      {email && (
        <Item title="Email" count="half">
          <ItemValue>{email}</ItemValue>
        </Item>
      )}
      <Item title="Wallet Address" count="half">
        <ItemValue>{name}</ItemValue>
      </Item>
    </Grid>
  )
}
export default AccountInfo
