import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { Dashboard } from '../../pages/dashboard'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore()

storiesOf('Dashboard', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('the dashboard', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
    }
    const network = {
      name: 4,
    }
    const transactions = {
      '0x1234': {
        hash: '0x12345678',
        confirmations: 12,
        status: 'mined',
        lock: '0x12345678a',
      },
      '0x5678': {
        hash: '0x56781234',
        confirmations: 4,
        status: 'mined',
        lock: '0x56781234a',
      },
      '0x89ab': {
        hash: '0x9abcdef0',
        confirmations: 2,
        status: 'mined',
        lock: '0x9abcdef0a',
      },
    }
    const locks = {
      '0x56781234a': {
        address: '0x56781234a',
        keyPrice: '10000000000000000000',
        expirationDuration: 86400,
        maxNumberOfKeys: 800,
        outstandingKeys: 32,
      },
      '0x12345678a': {
        address: '0x12345678a',
        name: 'My Blog',
        keyPrice: '27000000000000000',
        expirationDuration: 172800,
        maxNumberOfKeys: 240,
        outstandingKeys: 3,
      },
      '0x9abcdef0a': {
        address: '0x9abcdef0',
        name: 'Infinite Lock',
        keyPrice: '27000000000000000',
        expirationDuration: 172800,
        maxNumberOfKeys: 0,
        outstandingKeys: 10,
      },
    }
    return (
      <Dashboard
        network={network}
        account={account}
        transactions={transactions}
        locks={locks}
      />
    )
  })
