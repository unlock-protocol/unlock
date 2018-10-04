import React from 'react'
import { storiesOf } from '@storybook/react'
import { Lock } from '../../components/consumer/Lock'
import { Provider } from 'react-redux'
import createUnlockStore from '../../createUnlockStore'

let store = createUnlockStore()

storiesOf('Lock', Lock)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .add('With no key purchased', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: '100',
      expirationDuration: '10',
    }
    const currentKey = {
      expiration: 0,
    }
    return (
      <Lock currentKey={currentKey} account={account} lock={lock} />
    )
  })
  .add('With no key purchased, longer duration and a higher price', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '100',
    }
    const currentKey = {
      expiration: 0,
    }
    return (
      <Lock currentKey={currentKey} account={account} lock={lock} />
    )
  })
  .add('With a valid key', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: '100',
      expirationDuration: '10',
    }
    const currentKey = {
      expiration: (new Date().getTime() + 1000 * 60 * 60 * 24) / 1000,
    }
    return (
      <Lock currentKey={currentKey} account={account} lock={lock} />
    )
  })
  .add('With an expired key', () => {
    const account = {
      address: '0xabc',
    }
    const lock = {
      keyPrice: '100',
      expirationDuration: '10',
    }
    const currentKey = {
      expiration: 1,
    }
    return (
      <Lock currentKey={currentKey} account={account} lock={lock} />
    )
  })
  .add('With no lock', () => {
    const account = {
      address: '0xabc',
    }
    const lock = null
    const currentKey = {
      expiration: 0,
    }
    return (
      <Lock currentKey={currentKey} account={account} lock={lock} />
    )
  })
