import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import {
  EventContent,
  mapStateToProps,
} from '../../../components/content/EventContent'
import { MONTH_NAMES, TRANSACTION_TYPES } from '../../../constants'
import createUnlockStore from '../../../createUnlockStore'
import configure from '../../../config'
import { ConfigContext } from '../../../utils/withConfig'
import { KeyStatus } from '../../../selectors/keys'
import { transactionTypeMapping } from '../../../utils/types'

const store = createUnlockStore({})
const config = configure()
const ConfigProvider = ConfigContext.Provider

const event = {
  date: new Date(2063, 10, 23, 18, 30),
  name: 'My Doctor Who party',
  description: `Unbelievably, it's been 100 years since it first came to our screens.

Join us for an hour or two of fine entertainment.`,
  location: 'Totters Lane, London',
  lockAddress: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
  duration: 3600,
}

const lock = {
  keyPrice: '0.01',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
  address: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
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

const account = { address: 'foo' }

describe('EventContent', () => {
  it('should display an event when given appropriate properties', () => {
    expect.assertions(4)

    const wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <EventContent
            event={event}
            lock={lock}
            purchaseKey={() => {}}
            loadEvent={() => {}}
            transaction={null}
            account={account}
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
    expect(wrapper.getByText('6:30pm - 7:30pm')).not.toBeNull()
  })

  it('should display an event with an ERC20 price when given appropriate properties', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <EventContent
            event={event}
            lock={erc20Lock}
            purchaseKey={() => {}}
            loadEvent={() => {}}
            transaction={null}
            account={account}
            config={config}
          />
        </ConfigProvider>
      </Provider>
    )

    expect(wrapper.queryByText('0.01 DEV', { exact: false })).not.toBeNull()
  })
})

describe('mapStateToProps', () => {
  it('sets a value from initial state', () => {
    expect.hasAssertions()
    const keyDate = new Date('2038-01-17')
    const props = mapStateToProps(
      {
        locks: {
          abc123: { address: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9' },
        },
        event,
        tickets: {
          '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9': 'foobar',
        },
        keys: {
          '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9-foo': {
            lock: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
            id: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9-foo',
            owner: 'foo',
            expiration: keyDate,
            transactions: {
              def234: {
                type: transactionTypeMapping(TRANSACTION_TYPES.KEY_PURCHASE),
                key: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9-foo',
                confirmations: 3,
                status: 'mined',
              },
            },
          },
        },
        account: {
          address: 'foo',
        },
        transactions: {
          def234: {
            type: transactionTypeMapping(TRANSACTION_TYPES.KEY_PURCHASE),
            key: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9-foo',
            confirmations: 3,
            status: 'mined',
          },
        },
        router: {
          location: {
            pathname: '/event/0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
          },
        },
      },
      { config }
    )

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
        duration: event.duration,
      },
      lock: {
        address: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
      },
      lockKey: {
        expiration: keyDate,
        id: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9-foo',
        lock: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9',
        owner: 'foo',
        transactions: {
          def234: {
            type: transactionTypeMapping(TRANSACTION_TYPES.KEY_PURCHASE),
            key: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9-foo',
            confirmations: 3,
            status: 'mined',
          },
        },
      },
      transaction: {
        type: transactionTypeMapping(TRANSACTION_TYPES.KEY_PURCHASE),
        key: '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9-foo',
        confirmations: 3,
        status: 'mined',
      },
      keyStatus: KeyStatus.CONFIRMING,
    }

    expect(props).toEqual(expectedProps)
  })
})
