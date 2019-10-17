import React from 'react'
import { storiesOf } from '@storybook/react'
import { AccountInfo } from '../../components/interface/user-account/AccountInfo'
import { ChangePassword } from '../../components/interface/user-account/ChangePassword'
import {
  KeyPurchaseConfirmation,
  makePriceBreakdown,
  displayCard,
} from '../../components/interface/user-account/KeyPurchaseConfirmation'
import { PaymentMethods } from '../../components/interface/user-account/PaymentMethods'
import { EjectAccount } from '../../components/interface/user-account/EjectAccount'
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

const passwordEncryptedPrivateKey = {
  address: '51eb293d64dd50182a087583bf5c94455b323a83',
  id: '0bace22e-28c9-4e58-a89f-2fd85ca3dcaf',
  version: 3,
  Crypto: {
    cipher: 'aes-128-ctr',
    cipherparams: {
      iv: '1e0f548a4246a2b42efd9e5a05952eb9',
    },
    ciphertext:
      'e9f255789dea348c987f6b2b2f2504da3e956560379d7615ab1d85815dbd6021',
    kdf: 'scrypt',
    kdfparams: {
      salt: '8bd0cc6c24d0d3372ffdf60006a9bac51a2c943b4a57a253398571f50d0b8715',
      n: 8192,
      dklen: 32,
      p: 1,
      r: 8,
    },
    mac: '6784fc481e7998b6794b202f83bf446b63caf0dc1facab127ac55ae6e9f2120e',
  },
  'x-ethers': {
    client: 'ethers.js',
    gethFilename:
      'UTC--2019-10-17T17-57-17.0Z--51eb293d64dd50182a087583bf5c94455b323a83',
    mnemonicCounter: '7952a710ed700164ac58f5145eb9e502',
    mnemonicCiphertext: '35396c7400c54b026f1080fe78e9915a',
    path: "m/44'/60'/0'/0/0",
    version: '0.1',
  },
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
        card="-"
        priceBreakdown={{}}
        errors={[]}
      />
    )
  })
  .add('KeyPurchaseConfirmation, with info', () => {
    return (
      <KeyPurchaseConfirmation
        emailAddress="jenny@googlemail.com"
        signPurchaseData={signPurchaseData}
        lock={lock}
        card={displayCard(cards[0])}
        priceBreakdown={priceBreakdown}
        errors={[]}
      />
    )
  })
  .add('PaymentMethods', () => {
    return <PaymentMethods cards={cards} />
  })
  .add('EjectAccount', () => {
    return <EjectAccount encryptedPrivateKey={passwordEncryptedPrivateKey} />
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
