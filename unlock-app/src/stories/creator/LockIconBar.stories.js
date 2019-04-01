import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import { Provider } from 'react-redux'
import LockIconBar from '../../components/creator/lock/LockIconBar'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'

const config = {
  requiredConfirmations: 12,
}

const store = createUnlockStore({
  transactions: {
    '0xpending': {
      status: 'pending',
    },
    '0xsubmitted': {
      status: 'submitted',
    },
    '0xconfirming': {
      status: 'mined',
      confirmations: config.requiredConfirmations - 1,
    },
    '0xmined': {
      status: 'mined',
      confirmations: config.requiredConfirmations + 1,
    },
  },
})

const ConfigProvider = ConfigContext.Provider

storiesOf('LockIconBar', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('LockIconBar, no lock creation transaction', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0xnotyetavailable',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, pending transaction', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0xpending',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, submitted transaction', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0xsubmitted',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar, confirming transaction', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0xconfirming',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
  .add('LockIconBar', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0xmined',
    }
    return (
      <LockIconBar
        lock={lock}
        toggleCode={action('toggleCode')}
        edit={action('edit')}
      />
    )
  })
