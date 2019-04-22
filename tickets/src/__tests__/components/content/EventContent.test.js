import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import { EventContent } from '../../../components/content/EventContent'
import { MONTH_NAMES } from '../../../constants'
import createUnlockStore from '../../../createUnlockStore'
import configure from '../../../config'
import { ConfigContext } from '../../../utils/withConfig'

const store = createUnlockStore({})
const ConfigProvider = ConfigContext.Provider

describe('EventContent', () => {
  it('should display an event when given appropriate properties', () => {
    expect.assertions(3)
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

    const wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <EventContent
            event={event}
            lock={lock}
            purchaseKey={() => {}}
            transaction={null}
            config={config}
          />
        </ConfigProvider>
      </Provider>
    )

    expect(wrapper.getByText(event.name)).not.toBeNull()
    expect(wrapper.getByText(event.location)).not.toBeNull()
    const dateString =
      MONTH_NAMES[event.date.getMonth()] +
      ' ' +
      event.date.getDate() +
      ', ' +
      event.date.getFullYear()
    expect(wrapper.getByText(dateString)).not.toBeNull()
  })
})
