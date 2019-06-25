import React from 'react'
import { storiesOf } from '@storybook/react'
import { AccountInfo } from '../../components/interface/user-account/AccountInfo'
import { ChangePassword } from '../../components/interface/user-account/ChangePassword'
import { KeyPurchaseConfirmation } from '../../components/interface/user-account/KeyPurchaseConfirmation'
import { changePassword, confirmKeyPurchase } from '../../actions/user'
import { Grid } from '../../components/interface/user-account/styles'

storiesOf('User Account/Components/AccountInfo', module)
  .add('no info', () => {
    return <AccountInfo email="" address="" />
  })
  .add('info provided', () => {
    return (
      <AccountInfo
        emailAddress="gordon@lonsdale.me"
        address="0x09438E46Ea66647EA65E4b104C125c82076FDcE5"
      />
    )
  })

storiesOf('User Account/Components/ChangePassword', module).add(
  'default',
  () => {
    return <ChangePassword changePassword={changePassword} />
  }
)

storiesOf('User Account/Components/KeyPurchaseConfirmation', module).add(
  'default',
  () => {
    return (
      <KeyPurchaseConfirmation
        emailAddress="jenny@googlemail.com"
        confirmKeyPurchase={confirmKeyPurchase}
      />
    )
  }
)

storiesOf('User Account/Settings', module).add('Mock settings page', () => {
  return (
    <Grid>
      <AccountInfo
        emailAddress="gordon@lonsdale.me"
        address="0x09438E46Ea66647EA65E4b104C125c82076FDcE5"
      />
      <ChangePassword changePassword={changePassword} />
    </Grid>
  )
})
