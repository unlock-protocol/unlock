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
        <CreatorLocks />
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
        <CreatorLocks />
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
  it('should enable editing of an existing lock when edit is pressed', () => {
    const locks = {
      '0x1234567890': {
        address: '0x1234567890',
        transaction: 'transactionid',
        keyPrice: '100000000000000000',
        balance: '1',
        expirationDuration: 100,
      },
    }

    const store = createUnlockStore({})

    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks createLock={() => {}} locks={locks} />
      </Provider>
    )
    wrapper.debug()

    const editButton = wrapper.getByTitle('Edit')
    rtl.fireEvent.click(editButton)

    expect(wrapper.queryByValue('0.01')).not.toBeNull()
  })
})
