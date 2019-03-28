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
  it('should call createLock when submit button is pressed', () => {
    expect.assertions(1)
    const createLock = jest.fn()

    const store = createUnlockStore({
      account: {},
    })

    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks
          createLock={createLock}
          formIsVisible
          hideForm={() => {}}
        />
      </Provider>
    )

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
          formIsVisible={false}
          hideForm={() => {}}
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
          formIsVisible={false}
          hideForm={() => {}}
        />
      </Provider>
    )
    expect(wrapper.getByText('loading')).not.toBeNull()
  })

  describe('mapStateToProps', () => {
    it('should yield a loading boolean based on state', () => {
      expect.assertions(2)
      expect(
        mapStateToProps({
          loading: 3,
          lockFormStatus: {
            visible: false,
          },
        }).loading
      ).toBe(true)
      expect(
        mapStateToProps({
          loading: 0,
          lockFormStatus: {
            visible: false,
          },
        }).loading
      ).toBe(false)
    })
  })
})
