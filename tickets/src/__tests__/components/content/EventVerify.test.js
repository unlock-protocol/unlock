import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import {
  EventVerify,
  mapStateToProps,
} from '../../../components/content/EventVerify'
import createUnlockStore from '../../../createUnlockStore'
import configure from '../../../config'
import { ConfigContext } from '../../../utils/withConfig'

const store = createUnlockStore({})

const event = {
  date: new Date(2063, 10, 23),
  name: 'My Doctor Who party',
  description: `Unbelievably, it's been 100 years since it first came to our screens.

Join us for an hour or two of fine entertainment.`,
  location: 'Totters Lane, London',
  lockAddress: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
}

const config = configure({})

const ConfigProvider = ConfigContext.Provider

const lock = {
  keyPrice: '0.01',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
  address: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
  transaction: 'deployedid',
}

describe('EventVerify', () => {
  it('should display an event when given appropriate properties', () => {
    expect.assertions(2)

    const wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <EventVerify lock={lock} event={event} valid={null} />
        </ConfigProvider>
      </Provider>
    )

    expect(wrapper.getByText(event.name)).not.toBeNull()
  })

  it('should display a validating notice when the valid property is not set yet', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <EventVerify lock={lock} event={event} valid={null} />
        </ConfigProvider>
      </Provider>
    )

    expect(wrapper.getByText('Ticket Validating')).not.toBeNull()
  })
})

describe('mapStateToProps', () => {
  expect.assertions(1)

  const props = mapStateToProps({
    locks: {
      abc123: { address: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9' },
    },
    event,
    account: {
      address: 'foo',
    },
    router: {
      location: {
        pathname: '/event/0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
      },
    },
  })

  const expectedProps = {
    account: {
      address: 'foo',
    },
    event: {
      name: event.name,
      date: event.date,
      description: event.description,
      location: event.location,
      lockAddress: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
    },
    lock: {
      address: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
    },
  }

  expect(props).toEqual(expectedProps)
})
