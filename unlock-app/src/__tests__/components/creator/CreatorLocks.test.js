import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import {
  CreatorLocks,
  mapStateToProps,
} from '../../../components/creator/CreatorLocks'
import createUnlockStore from '../../../createUnlockStore'

jest.mock('next/link', () => {
  return ({ children }) => children
})

describe('CreatorLocks', () => {
  it('should display form when create lock button is clicked', () => {
    expect.assertions(4)
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
    expect.assertions(4)
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
    expect.assertions(1)
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

  it('should show a message indicating that no lock has been created when no lock is there', () => {
    expect.assertions(1)
    const store = createUnlockStore()
    const lockFeed = []
    const loading = false
    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks
          lockFeed={lockFeed}
          loading={loading}
          createLock={() => {}}
        />
      </Provider>
    )
    expect(wrapper.getByText('Create a lock to get started')).not.toBeNull()
  })

  it('should show the loading icon when locks are being loaded', () => {
    expect.assertions(1)
    const store = createUnlockStore()
    const lockFeed = []
    const loading = true
    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks
          lockFeed={lockFeed}
          loading={loading}
          createLock={() => {}}
        />
      </Provider>
    )
    expect(wrapper.getByText('loading')).not.toBeNull()
  })

  describe('mapStateToProps', () => {
    it('should yield a loading boolean based on state', () => {
      expect.assertions(2)
      expect(mapStateToProps({ loading: 3 }).loading).toBe(true)
      expect(mapStateToProps({ loading: 0 }).loading).toBe(false)
    })
  })
})
