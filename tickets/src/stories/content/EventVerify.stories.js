import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import { EventVerify } from '../../components/content/EventVerify'
import createUnlockStore from '../../createUnlockStore'
import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'

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
const store = createUnlockStore({})
const config = configure({})
const ConfigProvider = ConfigContext.Provider

storiesOf('Event verification page', module)
  .addDecorator(getStory => (
    <Provider store={store}>
      <ConfigProvider value={config}>{getStory()}</ConfigProvider>
    </Provider>
  ))
  .add('Event verification page with verification in progress', () => {
    return (
      <EventVerify
        lock={lock}
        event={event}
        valid={null}
        loadEvent={() => {}}
        config={config}
      />
    )
  })
