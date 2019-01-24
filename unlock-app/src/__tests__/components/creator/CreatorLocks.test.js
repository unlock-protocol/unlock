import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import { CreatorLocks } from '../../../components/creator/CreatorLocks'
import createUnlockStore from '../../../createUnlockStore'

jest.mock('next/link', () => {
  return ({ children }) => children
})

describe('CreatorLocks', () => {
  it('should display form when create lock button is clicked', () => {
    const store = createUnlockStore({
      account: {},
    })

    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks createLock={() => {}} />
      </Provider>
    )

    expect(wrapper.queryByValue('New Lock')).toBeNull()
    expect(wrapper.queryByText('Submit')).toBeNull()

    const createButton = wrapper.getByText('Create Lock')
    rtl.fireEvent.click(createButton)

    expect(wrapper.queryByValue('New Lock')).not.toBeNull()
    expect(wrapper.queryByText('Submit')).not.toBeNull()
  })

  it('should disappear when cancel button is clicked', () => {
    const store = createUnlockStore({
      account: {},
    })

    let wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks createLock={() => {}} />
      </Provider>
    )

    let createButton = wrapper.getByText('Create Lock')
    rtl.fireEvent.click(createButton)

    expect(wrapper.queryByValue('New Lock')).not.toBeNull()
    expect(wrapper.queryByText('Submit')).not.toBeNull()

    let cancelButton = wrapper.getByText('Cancel')
    rtl.fireEvent.click(cancelButton)

    expect(wrapper.queryByValue('New Lock')).toBeNull()
    expect(wrapper.queryByText('Submit')).toBeNull()
  })
  it('should call createLock when submit button is pressed', () => {
    const createLock = jest.fn()

    const store = createUnlockStore({
      account: {},
    })

    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks createLock={createLock} />
      </Provider>
    )

    const createButton = wrapper.getByText('Create Lock')
    rtl.fireEvent.click(createButton)

    const submitButton = wrapper.getByText('Submit')
    rtl.fireEvent.click(submitButton)

    expect(createLock).toHaveBeenCalled()
  })
  it('should display locks in descending order by blockNumber', () => {
    const transactions = {
      '0x1234': {
        hash: '0x12345678',
        confirmations: 12,
        status: 'mined',
        lock: '0x12345678a',
        blockNumber: 1,
      },
      '0x5678': {
        hash: '0x56781234',
        confirmations: 4,
        status: 'mined',
        lock: '0x56781234a',
        blockNumber: 2,
      },
      '0x89ab': {
        hash: '0x9abcdef0',
        confirmations: 2,
        status: 'mined',
        lock: '0x9abcdef0a',
        blockNumber: 3,
      },
    }
    const locks = {
      '0x56781234a': {
        address: '0x56781234a',
        name: 'The Beta Blog',
        keyPrice: '10000000000000000000',
        expirationDuration: 86400,
        maxNumberOfKeys: 800,
        outstandingKeys: 32,
        transaction: '0x5678',
      },
      '0x12345678a': {
        address: '0x12345678a',
        name: 'The Alpha Blog',
        keyPrice: '27000000000000000',
        expirationDuration: 172800,
        maxNumberOfKeys: 240,
        outstandingKeys: 3,
        transaction: '0x1234',
      },
      '0x9abcdef0a': {
        address: '0x9abcdef0',
        name: 'The Gamma Blog',
        keyPrice: '27000000000000000',
        expirationDuration: 172800,
        maxNumberOfKeys: 0,
        outstandingKeys: 10,
        transaction: '0x89ab',
      },
    }

    const createLock = jest.fn()

    const store = createUnlockStore({
      account: {},
    })

    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks
          createLock={createLock}
          locks={locks}
          transactions={transactions}
        />
      </Provider>
    )

    const renderedLocks = wrapper.getAllByText(/Blog/)
    expect(renderedLocks).toHaveLength(3)
    // Lock "The Gamma Blog" has the highest blockNumber, so it should always appear first
    expect(renderedLocks[0].innerHTML).toMatch(/Gamma/)
    // "The Beta Blog" has the second highest, blockNumber, so it should appear second
    expect(renderedLocks[1].innerHTML).toMatch(/Beta/)
    // "The Alpha Blog" with the lowest  blockNumber appears last
    expect(renderedLocks[2].innerHTML).toMatch(/Alpha/)
  })
})
