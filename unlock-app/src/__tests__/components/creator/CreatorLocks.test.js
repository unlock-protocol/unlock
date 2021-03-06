import React from 'react'
import * as rtl from '@testing-library/react'
import hook from '../../../hooks/useLocks'

import { CreatorLocks } from '../../../components/creator/CreatorLocks'
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
    creationBlock: '2',
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
    creationBlock: '1',
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
    creationBlock: '3',
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
    creationBlock: '3',
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

  it.skip('should call createLock when submit button is pressed', () => {
    expect.assertions(2)
    const createLock = jest.fn((lock, callback) => callback())
    const hideForm = jest.fn()
    const wrapper = rtl.render(
      <ConfigProvider value={config}>
        <CreatorLocks
          account={account}
          createLock={createLock}
          formIsVisible
          hideForm={hideForm}
        />
      </ConfigProvider>
    )

    const submitButton = wrapper.getByText('Submit')
    rtl.fireEvent.click(submitButton)

    expect(createLock).toHaveBeenCalled()
    expect(hideForm).toHaveBeenCalled()
  })

  it('should show a message indicating that no lock has been created when no lock is there', () => {
    expect.assertions(1)
    hook.useLocks = jest.fn(() => [false, []])
    const loading = false
    const wrapper = rtl.render(
      <CreatorLocks
        account={account}
        loading={loading}
        createLock={() => {}}
        formIsVisible={false}
        hideForm={() => {}}
      />
    )
    expect(wrapper.getByText('Create a lock to get started')).not.toBeNull()
  })

  it('should show the loading icon when locks are being loaded', () => {
    expect.assertions(1)
    hook.useLocks = jest.fn(() => [true, []])
    const loading = true
    const wrapper = rtl.render(
      <CreatorLocks
        account={account}
        loading={loading}
        createLock={() => {}}
        formIsVisible={false}
        hideForm={() => {}}
      />
    )
    expect(wrapper.getByText('loading')).not.toBeNull()
  })
})
