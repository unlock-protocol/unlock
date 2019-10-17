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

const config = configure()

const lock = {
  keyPrice: '0.01',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
  address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
  transaction: 'deployedid',
}
const erc20Lock = {
  currencyContractAddress: config.erc20Contract.address,
  keyPrice: '0.01',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
  address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
  transaction: 'deployedid',
}

const event = {
  date: new Date(2063, 10, 23, 18, 30),
  name: 'My Doctor Who party',
  description: `Unbelievably, it's been 100 years since it first came to our screens.

Join us for an hour or two of fine entertainment.`,
  location: 'Totters Lane, London',
  duration: 3600,
  links: [
    {
      href: 'https://party.com/fun',
      text: 'Event Website',
    },
  ],
}
const purchaseKey = () => {}
const dummyFunc = () => {}

const account = {
  address: 'foo',
}

storiesOf('Event RSVP page', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
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
          loadEvent={dummyFunc}
          signAddress={dummyFunc}
          transaction={transaction}
          account={account}
        />
      </ConfigProvider>
    )
  })
  .add('Event RSVP page with no website', () => {
    const transaction = null
    const eventNoWebsite = {
      ...event,
    }

    eventNoWebsite.links = [
      {
        href: '',
      },
    ]

    return (
      <ConfigProvider value={config}>
        <EventContent
          event={eventNoWebsite}
          lock={lock}
          config={config}
          purchaseKey={purchaseKey}
          loadEvent={dummyFunc}
          signAddress={dummyFunc}
          transaction={transaction}
          account={account}
        />
      </ConfigProvider>
    )
  })
  .add('Event RSVP page with unpurchased key for ERC20 lock', () => {
    const transaction = null

    return (
      <EventContent
        event={event}
        lock={erc20Lock}
        config={config}
        purchaseKey={purchaseKey}
        loadEvent={dummyFunc}
        signAddress={dummyFunc}
        transaction={transaction}
        account={account}
      />
    )
  })
  .add('Event RSVP page with submitted key', () => {
    const transaction = {
      status: 'submitted',
    }

    return (
      <EventContent
        event={event}
        lock={lock}
        config={config}
        purchaseKey={purchaseKey}
        loadEvent={dummyFunc}
        signAddress={dummyFunc}
        transaction={transaction}
        account={account}
      />
    )
  })
  .add('Event RSVP page with confirming key transaction', () => {
    const transaction = {
      status: 'mined',
      confirmations: 3,
    }

    return (
      <EventContent
        event={event}
        lock={lock}
        config={config}
        purchaseKey={purchaseKey}
        loadEvent={dummyFunc}
        signAddress={dummyFunc}
        transaction={transaction}
        account={account}
      />
    )
  })
  .add('Event RSVP page with confirmed key transaction', () => {
    const transaction = {
      status: 'mined',
      confirmations: 14,
    }

    return (
      <EventContent
        event={event}
        lock={lock}
        config={config}
        purchaseKey={purchaseKey}
        loadEvent={dummyFunc}
        signAddress={dummyFunc}
        transaction={transaction}
        account={account}
      />
    )
  })
  .add('Event RSVP page with confirming key', () => {
    return (
      <EventContent
        event={event}
        lock={lock}
        config={config}
        purchaseKey={purchaseKey}
        loadEvent={dummyFunc}
        signAddress={dummyFunc}
        keyStatus={KeyStatus.CONFIRMING}
        account={account}
      />
    )
  })
  .add('Event RSVP page with confirmed key', () => {
    return (
      <EventContent
        event={event}
        lock={lock}
        config={config}
        purchaseKey={purchaseKey}
        loadEvent={dummyFunc}
        signAddress={dummyFunc}
        keyStatus={KeyStatus.VALID}
        account={account}
      />
    )
  })
  .add('Event RSVP page with confirmed key and QR code', () => {
    return (
      <EventContent
        event={event}
        lock={lock}
        config={config}
        purchaseKey={purchaseKey}
        loadEvent={dummyFunc}
        signAddress={dummyFunc}
        keyStatus={KeyStatus.VALID}
        account={account}
        signedEventAddress="foobar"
      />
    )
  })
