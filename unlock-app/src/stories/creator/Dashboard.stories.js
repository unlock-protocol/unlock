import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { Dashboard } from '../../pages/dashboard'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore()

storiesOf('Dashboard', Dashboard)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('the dashboard', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
    }
    const network = {
      name: 4,
    }
    const transactions = {
      all: {
        0x1234: {
          hash: '0x12345678',
          confirmations: 12,
          status: 'mined',
          lock: {
            address: '0x12345678a',
          },
        },
        0x5678: {
          hash: '0x56781234',
          confirmations: 4,
          status: 'mined',
          lock: {
            address: '0x56781234a',
          },
        },
      },
    }
    const locks = {
      0x5678a: {
        address: '0x56781234a',
        keyPrice: '10000000000000000000',
        expirationDuration: '86400',
        maxNumberOfKeys: '800',
        outstandingKeys: '32',
      },
      0x1234a: {
        address: '0x12345678a',
        name: 'My Blog',
        keyPrice: '27000000000000000',
        expirationDuration: '172800',
        maxNumberOfKeys: '240',
        outstandingKeys: '3',
      },
    }
    return (
      <Dashboard network={network} account={account} transactions={transactions} locks={locks} />
    )
  })
