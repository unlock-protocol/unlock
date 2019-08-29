import React from 'react'
import { storiesOf } from '@storybook/react'
import { AccountInfo } from '../../components/interface/user-account/AccountInfo'
import { ChangePassword } from '../../components/interface/user-account/ChangePassword'
import {
  KeyPurchaseConfirmation,
  makePriceBreakdown,
} from '../../components/interface/user-account/KeyPurchaseConfirmation'
import { PaymentMethods } from '../../components/interface/user-account/PaymentMethods'
import { changePassword, signPurchaseData } from '../../actions/user'
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

const key = {
  expiration: 12345678,
  transactions: [],
  status: 'confirming',
  confirmations: 0,
  lock: 'not a real address',
  owner: null,
}
const lock = {
  name: 'My ERC20 Lock',
  address: 'not a real address',
  keyPrice: '0.2',
  expirationDuration: 12345678,
  currencyContractAddress: 'not a real currency contract address',
  key,
}

const fees = {
  creditCardProcessing: 450,
  gasFee: 30,
  keyPrice: 100,
  unlockServiceFee: 20,
}

const priceBreakdown = makePriceBreakdown(fees)

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
  .add('KeyPurchaseConfirmation, no info provided', () => {
    return (
      <KeyPurchaseConfirmation
        emailAddress="jenny@googlemail.com"
        signPurchaseData={signPurchaseData}
        cards={[]}
        priceBreakdown={{}}
      />
    )
  })
  .add('KeyPurchaseConfirmation, with info', () => {
    return (
      <KeyPurchaseConfirmation
        emailAddress="jenny@googlemail.com"
        signPurchaseData={signPurchaseData}
        lock={lock}
        cards={cards}
        priceBreakdown={priceBreakdown}
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
