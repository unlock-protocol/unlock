import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import { CreatorLock } from '../../../components/creator/CreatorLock'
import configure from '../../../config'
import createUnlockStore from '../../../createUnlockStore'
import { UNLIMITED_KEYS_COUNT } from '../../../constants'
import { ConfigContext } from '../../../utils/withConfig'

jest.mock('next/link', () => {
  return ({ children }) => children
})

const lock = {
  address: '0x1234567890',
  transaction: 'transactionid',
  keyPrice: '0.1',
  balance: '1',
  expirationDuration: 100,
}
const keylock = {
  address: '0x1234567890',
  transaction: 'transactionid',
  keyPrice: '1',
  balance: '1',
  outstandingKeys: 1,
  maxNumberOfKeys: 10,
  expirationDuration: 100,
}
const unlimitedlock = {
  address: '0x1234567890',
  transaction: 'transactionid',
  keyPrice: '1',
  balance: '1',
  outstandingKeys: 1,
  maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
  unlimitedKeys: true,
  expirationDuration: 100,
}

const transaction = {
  address: '0x0987654321',
  confirmations: 12,
  status: 'mined',
  lock: 'lockid',
}

const ConfigProvider = ConfigContext.Provider

describe('CreatorLock', () => {
  it('should show embed code when the button is clicked', () => {
    expect.assertions(2)
    const config = configure()

    const store = createUnlockStore()

    let wrapper = rtl.render(
      <ConfigProvider value={config}>
        <Provider store={store}>
          <CreatorLock
            lock={lock}
            transaction={transaction}
            updateKeyPrice={() => {}}
          />
        </Provider>
      </ConfigProvider>
    )

    expect(
      wrapper.queryByText(
        'Include this script in the <head> section of your page',
        { exact: false }
      )
    ).toBeNull()

    let codeButton = wrapper.getByTitle('Embed')
    rtl.fireEvent.click(codeButton)

    expect(
      wrapper.queryByText(
        'Include this script in the <head> section of your page',
        { exact: false }
      )
    ).not.toBeNull()
  })

  it('should open the edit form when the button is clicked', () => {
    expect.assertions(1)
    const config = configure()

    const store = createUnlockStore({
      account: {},
    })

    let wrapper = rtl.render(
      <ConfigProvider value={config}>
        <Provider store={store}>
          <CreatorLock
            lock={lock}
            transaction={transaction}
            updateKeyPrice={() => {}}
          />
        </Provider>
      </ConfigProvider>
    )

    let editButton = wrapper.getByTitle('Edit')
    rtl.fireEvent.click(editButton)

    expect(wrapper.getByValue('0.1')).not.toBeNull()
  })

  it('should display the correct number of keys', () => {
    expect.assertions(1)
    const config = configure()

    const store = createUnlockStore({
      transactions: {
        transactionid: transaction,
      },
      locks: {
        [keylock.address]: keylock,
      },
    })

    let wrapper = rtl.render(
      <ConfigProvider value={config}>
        <Provider store={store}>
          <CreatorLock
            lock={keylock}
            transaction={transaction}
            updateKeyPrice={() => {}}
          />
        </Provider>
      </ConfigProvider>
    )

    expect(wrapper.queryByText('1/10')).not.toBeNull()
  })

  it('should display infinite keys correctly', () => {
    expect.assertions(1)
    const config = configure()

    const store = createUnlockStore({
      transactions: {
        transactionid: transaction,
      },
      locks: {
        [unlimitedlock.address]: unlimitedlock,
      },
    })

    let wrapper = rtl.render(
      <ConfigProvider value={config}>
        <Provider store={store}>
          <CreatorLock
            lock={unlimitedlock}
            transaction={transaction}
            updateKeyPrice={() => {}}
          />
        </Provider>
      </ConfigProvider>
    )

    expect(wrapper.queryByText('1/∞')).not.toBeNull()
  })
})
