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

// Base64-encoded event signature
const encodedSignature =
  'MHgyNzJhNDU4MTFkMzdlM2VjNDFmMDRjMWZlZTRkNDYzZDE2Y2E1ZDExMmM0MThlZGNjNTA1NjcwZWJmZmE1MDE0MWU1OGU4MzBkMGUyMDNhMGY0Yzk0Yjc2MTYwZjI3NTlkMDkyOTZlYzA5OTZlYjVmNWI2NWM1NDNjMmY0NWEyMjAw'
const decodedSignature =
  '0x272a45811d37e3ec41f04c1fee4d463d16ca5d112c418edcc505670ebffa50141e58e830d0e203a0f4c94b76160f2759d09296ec0996eb5f5b65c543c2f45a2200'

describe('EventVerify', () => {
  it('should display an event when given appropriate properties', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <EventVerify
            lock={lock}
            event={event}
            valid={null}
            loadEvent={() => {}}
          />
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
          <EventVerify
            lock={lock}
            event={event}
            valid={null}
            loadEvent={() => {}}
          />
        </ConfigProvider>
      </Provider>
    )

    expect(wrapper.getByText('Ticket Validating')).not.toBeNull()
  })
})

describe('mapStateToProps', () => {
  it('should return correct properties', () => {
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
          pathname:
            '/checkin/0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9/' +
            '0x49dbdc4CdBda8dc99c82D66d97B264386E41c0E9/' +
            encodedSignature,
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
      publicKey: '0x49dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
      signature: decodedSignature,
    }

    expect(props).toEqual(expectedProps)
  })
})
