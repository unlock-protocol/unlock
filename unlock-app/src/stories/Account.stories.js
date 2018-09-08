import React from 'react'
import { storiesOf } from '@storybook/react'
import { Account } from '../components/Account'

let accountPicker = () => {
  return false // We don't need this to do anything in the storybook context
}

storiesOf('Account')
  .add('With address and balance', () => {
    let account = {
      address: '0xabc',
      balance: '300000000000000000',
    }
    return (
      <Account showAccountPicker={accountPicker} account={account} />
    )
  })
  .add('With address but no balance', () => {
    let account = {
      address: '0xabc',
    }
    return (
      <Account showAccountPicker={accountPicker} account={account} />
    )
  })
  .add('With no address', () => {
    let account = {}
    return (
      <Account showAccountPicker={accountPicker} account={account} />
    )
  })