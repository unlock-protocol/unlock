import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import { CreatorLocks } from '../../../components/creator/CreatorLocks'
import createUnlockStore from '../../../createUnlockStore'

jest.mock('next/link', () => {
  return ({ children }) => children
})

describe('CreatorLockForm', () => {
  it('should display when create lock button is clicked', () => {
    const store = createUnlockStore({
      account: {},
    })

    let wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks />
      </Provider>
    )

    expect(wrapper.queryByValue('New Lock')).toBeNull()
    expect(wrapper.queryByText('Submit')).toBeNull()

    let createButton = wrapper.getByText('Create Lock')
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
  it('should not allow a form with invalid data to be submitted', () => {
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

    // Setting name to be an invalid value (empty)
    let name = wrapper.queryByValue('New Lock')
    rtl.fireEvent.change(name, { target: { value: '' }})

    rtl.fireEvent.click(wrapper.queryByText('Submit'))

    // Form should still exist
    expect(wrapper.queryByText('Submit')).not.toBeNull()
  })
})
