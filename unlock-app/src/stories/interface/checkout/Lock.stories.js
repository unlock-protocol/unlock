import React from 'react'
import { storiesOf } from '@storybook/react'
import { Lock, LoadingLock } from '../../../components/interface/checkout/Lock'

const lock = {
  asOf: 3196,
  name: 'ETH Lock',
  maxNumberOfKeys: -1,
  owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
  expirationDuration: 300,
  keyPrice: '0.01',
  publicLockVersion: 6,
  balance: '0.03',
  outstandingKeys: 1,
  currencyContractAddress: null,
  unlimitedKeys: true,
  address: '0xEE9FE39966DF737eECa5920ABa975c283784Faf8',
}

storiesOf('Checkout Lock', module)
  .add('Loading', () => {
    return <LoadingLock />
  })
  .add('Insufficient Balance', () => {
    return <Lock lock={lock} balances={{}} />
  })
  .add('Active', () => {
    return <Lock lock={lock} balances={{ eth: '1' }} />
  })
