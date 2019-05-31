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
    abc123: { address: 'abc123', owner: '0xuser' },
    def459: { address: 'def456', owner: '0xuser' },
  },
  account: {
    address: '0xuser',
  },
})

const now = new Date(2019, 3, 25, 12, 35, 0) // March 25th, 2019

storiesOf('Create event landing page', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Create event page', () => {
    return <CreateContent now={now} />
  })
  .add('Create event page, event submitted', () => {
    return <CreateContent now={now} submitted />
  })
