import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import { EventContent } from '../../components/content/EventContent'

import createUnlockStore from '../../createUnlockStore'
import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'
import { KeyStatus } from '../../selectors/keys'

const store = createUnlockStore({})

const ConfigProvider = ConfigContext.Provider

const lock = {
  keyPrice: '0.01',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
  address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
  transaction: 'deployedid',
}
const event = {
  date: new Date(2063, 10, 23),
  name: 'My Doctor Who party',
  description: `Unbelievably, it's been 100 years since it first came to our screens.
    
Join us for an hour or two of fine entertainment.`,
  location: 'Totters Lane, London',
}
const config = configure({})
const purchaseKey = () => {}
const loadEvent = () => {}

storiesOf('Event RSVP page', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Event RSVP page with unpurchased key', () => {
    const transaction = null

    return (
      <ConfigProvider value={config}>
        <EventContent
          event={event}
          lock={lock}
          config={config}
          purchaseKey={purchaseKey}
          loadEvent={loadEvent}
          transaction={transaction}
        />
      </ConfigProvider>
    )
  })
  .add('Event RSVP page with submitted key', () => {
    const transaction = {
      status: 'submitted',
    }

    return (
      <ConfigProvider value={config}>
        <EventContent
          event={event}
          lock={lock}
          config={config}
          purchaseKey={purchaseKey}
          loadEvent={loadEvent}
          transaction={transaction}
        />
      </ConfigProvider>
    )
  })
  .add('Event RSVP page with confirming key transaction', () => {
    const transaction = {
      status: 'mined',
      confirmations: 3,
    }

    return (
      <ConfigProvider value={config}>
        <EventContent
          event={event}
          lock={lock}
          config={config}
          purchaseKey={purchaseKey}
          loadEvent={loadEvent}
          transaction={transaction}
        />
      </ConfigProvider>
    )
  })
  .add('Event RSVP page with confirmed key transaction', () => {
    const transaction = {
      status: 'mined',
      confirmations: 14,
    }

    return (
      <ConfigProvider value={config}>
        <EventContent
          event={event}
          lock={lock}
          config={config}
          purchaseKey={purchaseKey}
          loadEvent={loadEvent}
          transaction={transaction}
        />
      </ConfigProvider>
    )
  })
  .add('Event RSVP page with confirming key', () => {
    return (
      <ConfigProvider value={config}>
        <EventContent
          event={event}
          lock={lock}
          config={config}
          purchaseKey={purchaseKey}
          loadEvent={loadEvent}
          keyStatus={KeyStatus.CONFIRMING}
        />
      </ConfigProvider>
    )
  })
  .add('Event RSVP page with confirmed key', () => {
    return (
      <ConfigProvider value={config}>
        <EventContent
          event={event}
          lock={lock}
          config={config}
          purchaseKey={purchaseKey}
          loadEvent={loadEvent}
          keyStatus={KeyStatus.VALID}
        />
      </ConfigProvider>
    )
  })
