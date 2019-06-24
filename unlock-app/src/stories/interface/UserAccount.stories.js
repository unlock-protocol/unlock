import React from 'react'
import { storiesOf } from '@storybook/react'
import { AccountInfo } from '../../components/interface/user-account/AccountInfo'
import { ChangePassword } from '../../components/interface/user-account/ChangePassword'
import { KeyPurchaseConfirmation } from '../../components/interface/user-account/KeyPurchaseConfirmation'
import { PaymentMethods } from '../../components/interface/user-account/PaymentMethods'
import { changePassword, confirmKeyPurchase } from '../../actions/user'
import { Grid } from '../../components/interface/user-account/styles'

const cards = [
  {
    id: 'card_1Eox8QIsiZS2oQBMkU2KqFnq',
    brand: 'Visa',
    exp_month: 8,
    exp_year: 2020,
    last4: '4242',
  },
  {
    id: 'card_1EoxVMIsiZS2oQBMFzQ3ToR5',
    brand: 'American Express',
    exp_month: 12,
    exp_year: 2020,
    last4: '0005',
  },
]

storiesOf('User Account/Components', module)
  .add('AccountInfo, no info', () => {
    return <AccountInfo email="" address="" />
  })
  .add('AccountInfo, info provided', () => {
    return (
      <AccountInfo
        emailAddress="gordon@lonsdale.me"
        address="0x09438E46Ea66647EA65E4b104C125c82076FDcE5"
      />
    )
  })
  .add('ChangePassword', () => {
    return <ChangePassword changePassword={changePassword} />
  })
  .add('KeyPurchaseConfirmation', () => {
    return (
      <KeyPurchaseConfirmation
        emailAddress="jenny@googlemail.com"
        confirmKeyPurchase={confirmKeyPurchase}
      />
    )
  })
  .add('PaymentMethods', () => {
    return <PaymentMethods cards={cards} />
  })

storiesOf('User Account/Settings', module).add('Mock settings page', () => {
  return (
    <Grid>
      <AccountInfo
        emailAddress="gordon@lonsdale.me"
        address="0x09438E46Ea66647EA65E4b104C125c82076FDcE5"
      />
      <ChangePassword changePassword={changePassword} />
      <PaymentMethods cards={cards} />
    </Grid>
  )
})
