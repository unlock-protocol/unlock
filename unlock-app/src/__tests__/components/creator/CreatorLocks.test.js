import React from 'react'
import * as rtl from '@testing-library/react'
import hook from '../../../hooks/useLocks'

import { CreatorLocks } from '../../../components/creator/CreatorLocks'
import { ConfigContext } from '../../../utils/withConfig'
import { AuthenticationContext } from '../../../components/interface/Authenticate'

jest.mock('../../../hooks/useLocks', () => {
  return {
    useLocks: jest.fn(() => {
      return {
        loading: false,
        locks: mockLocks,
        addLock: () => {},
        error: null,
      }
    }),
  }
})

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

const account = '0x12345678'

describe('CreatorLocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show a message indicating that no lock has been created when no lock is there', () => {
    expect.assertions(1)
    hook.useLocks = jest.fn(() => {
      return {
        loading: false,
        locks: [],
        addLock: () => {},
        error: null,
      }
    })
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
    hook.useLocks = jest.fn(() => {
      return {
        loading: true,
        locks: mockLocks,
        addLock: () => {},
        error: null,
      }
    })
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
