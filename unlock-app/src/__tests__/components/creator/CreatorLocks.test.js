import React from 'react'
import * as rtl from '@testing-library/react'
import { Provider } from 'react-redux'
import hook from '../../../hooks/useLocks'

import {
  CreatorLocks,
  mapStateToProps,
} from '../../../components/creator/CreatorLocks'
import createUnlockStore from '../../../createUnlockStore'
import configure from '../../../config'
import { ConfigContext } from '../../../utils/withConfig'

jest.mock('../../../hooks/useLocks', () => {
  return {
    useLocks: jest.fn(() => [false, mockLocks]),
  }
})

const config = configure()

const ConfigProvider = ConfigContext.Provider

jest.mock('next/link', () => {
  return ({ children }) => children
})

const mockLocks = {
  '0x56781234a': {
    address: '0x56781234a',
    name: 'The Beta Blog',
    keyPrice: '10000000000000000000',
    expirationDuration: 86400,
    maxNumberOfKeys: 800,
    outstandingKeys: 32,
    transaction: '0x5678',
    owner: '0x12345678',
  },
  '0x12345678a': {
    address: '0x12345678a',
    name: 'The Alpha Blog',
    keyPrice: '27000000000000000',
    expirationDuration: 172800,
    maxNumberOfKeys: 240,
    outstandingKeys: 3,
    transaction: '0x1234',
    owner: '0x12345678',
  },
  '0x9abcdef0a': {
    address: '0x9abcdef0',
    name: 'The Gamma Blog',
    keyPrice: '27000000000000000',
    expirationDuration: 172800,
    maxNumberOfKeys: 0,
    outstandingKeys: 10,
    transaction: '0x89ab',
    owner: '0x12345678',
  },
  '0x9abcdef0b': {
    address: '0x9abcdef0',
    name: 'The Gamma Blog',
    keyPrice: '27000000000000000',
    expirationDuration: 172800,
    maxNumberOfKeys: 0,
    outstandingKeys: 10,
    transaction: '0x89ab',
    owner: '0x987654',
  },
}

const account = {
  address: '0x12345678',
  balance: '5',
}

describe('CreatorLocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call createLock when submit button is pressed', () => {
    expect.assertions(1)
    const createLock = jest.fn()

    const store = createUnlockStore({
      account,
    })

    const wrapper = rtl.render(
      <ConfigProvider value={config}>
        <Provider store={store}>
          <CreatorLocks
            account={account}
            createLock={createLock}
            formIsVisible
            hideForm={() => {}}
          />
        </Provider>
      </ConfigProvider>
    )

    const submitButton = wrapper.getByText('Submit')
    rtl.fireEvent.click(submitButton)

    expect(createLock).toHaveBeenCalled()
  })

  it('should show a message indicating that no lock has been created when no lock is there', () => {
    expect.assertions(1)
    hook.useLocks = jest.fn(() => [false, []])
    const store = createUnlockStore()
    const loading = false
    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks
          account={account}
          loading={loading}
          createLock={() => {}}
          formIsVisible={false}
          hideForm={() => {}}
        />
      </Provider>
    )
    expect(wrapper.getByText('Create a lock to get started')).not.toBeNull()
  })

  it('should show the loading icon when locks are being loaded', () => {
    expect.assertions(1)
    hook.useLocks = jest.fn(() => [true, []])
    const store = createUnlockStore()
    const loading = true
    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks
          account={account}
          loading={loading}
          createLock={() => {}}
          formIsVisible={false}
          hideForm={() => {}}
        />
      </Provider>
    )
    expect(wrapper.getByText('loading')).not.toBeNull()
  })

  describe('mapStateToProps', () => {
    it('should yield a formIsVisible boolean based on state for lockFormStatus', () => {
      expect.assertions(2)
      expect(
        mapStateToProps({
          account,
          lockFormStatus: {
            visible: true,
          },
        }).formIsVisible
      ).toBe(true)
      expect(
        mapStateToProps({
          account,
          lockFormStatus: {
            visible: false,
          },
        }).formIsVisible
      ).toBe(false)
    })
  })
})
