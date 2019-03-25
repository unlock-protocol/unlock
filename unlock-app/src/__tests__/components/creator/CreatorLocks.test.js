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

const account = {
  address: '0x12345678',
  balance: '5',
}

const network = {
  name: 1984,
}

let store
describe('CreatorLocks', () => {
  beforeEach(() => {
    store = createUnlockStore({
      account,
      network,
    })
  })
  it('should call createLock when submit button is pressed', () => {
    expect.assertions(1)
    const createLock = jest.fn()

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
    const lockFeed = []
    const loading = false
    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks
          lockFeed={lockFeed}
          loading={loading}
          createLock={() => {}}
          hideForm={() => {}}
        />
      </Provider>
    )
    expect(wrapper.getByText('Create a lock to get started')).not.toBeNull()
  })

  it('should show the loading icon when locks are being loaded', () => {
    expect.assertions(1)
    const lockFeed = []
    const loading = true
    const wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLocks
          lockFeed={lockFeed}
          loading={loading}
          hideForm={() => {}}
          formIsVisible={false}
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
