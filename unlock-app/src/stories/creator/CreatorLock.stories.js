import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import CreatorLock from '../../components/creator/CreatorLock'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({
  transactions: {
    '0x123': {
      status: 'mined',
      confirmations: 24,
    },
    '0x456': {
      status: 'mined',
      confirmations: 4,
    },
  },
  currency: {
    USD: 195.99,
  },
})

storiesOf('CreatorLock', CreatorLock)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Deployed', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: '240',
      outstandingKeys: '3',
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0x123',
    }
    return (
      <CreatorLock lock={lock} />
    )
  })
  .add('Confirming', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: '240',
      outstandingKeys: '3',
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0x456',
    }
    const transaction = {
      status: 'mined',
      confirmations: 2,
    }
    return (
      <CreatorLock lock={lock} transaction={transaction}  />
    )
  })
  .add('Not found', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: '240',
      outstandingKeys: '3',
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0x789',
    }
    return (
      <CreatorLock lock={lock} transaction={null} />
    )
  })
