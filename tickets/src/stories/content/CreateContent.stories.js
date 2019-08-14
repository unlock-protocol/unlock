import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import CreateContent from '../../components/content/CreateContent'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'

import createUnlockStore from '../../createUnlockStore'

const ConfigProvider = ConfigContext.Provider
const config = configure({
  unlockAppUrl: 'https://unlock-protocol.com',
  unlockTicketsUrl: 'https://tickets.unlock-protocol.com',
})

const store = createUnlockStore({
  locks: {
    abc123: { address: 'abc123', name: 'Lock with name', owner: '0xuser' },
    def459: { address: 'def456', owner: '0xuser' },
  },
  account: {
    address: '0xuser',
  },
  loading: 0,
})

const noLockStore = createUnlockStore({
  locks: {},
  account: {
    address: '0xuser',
  },
  loading: 8,
})

// We MUST NOT specify a TZ otherwise the snapshot fail when executed in a different env.
const now = new Date('Mar 25 2019 10:00:00')

storiesOf('Create event landing page', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .add('Create event page', () => {
    return (
      <Provider store={store}>
        <CreateContent now={now} />
      </Provider>
    )
  })
  .add('Create event page, no locks', () => {
    return (
      <Provider store={noLockStore}>
        <CreateContent now={now} loading="9" />
      </Provider>
    )
  })
  .add('Create event page, event submitted', () => {
    return (
      <Provider store={store}>
        <CreateContent now={now} submitted />
      </Provider>
    )
  })
  .add('Create event page, event saved', () => {
    return (
      <Provider store={store}>
        <CreateContent now={now} saved />
      </Provider>
    )
  })
