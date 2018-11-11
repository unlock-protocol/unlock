import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import {ShowUnlessUserHasKeyToAnyLock} from '../../../components/lock/ShowUnlessUserHasKeyToAnyLock'

describe('ShowUnlessUserHasKeyToAnyLock', () => {

  test('should show the children if there is no key for this lock', () => {
    const locks = [{
      address: '0x123',
    }]
    const keys = {
      '123': {
        lockAddress: '0x456',
      },
    }

    const wrapper = rtl.render(
      <ShowUnlessUserHasKeyToAnyLock locks={locks} keys={keys}>
        Show me
      </ShowUnlessUserHasKeyToAnyLock>)

    expect(wrapper.queryByText('Show me')).not.toBe(null)
  })

  test('should show the children if there is no valid key for this lock', () => {
    const locks = [{
      address: '0x123',
    }]
    const keys = {
      '123': {
        lockAddress: '0x123',
        expiration: (new Date().getTime() / 1000) - 60*60, // Expired one hour ago
      },
    }

    const wrapper = rtl.render(
      <ShowUnlessUserHasKeyToAnyLock locks={locks} keys={keys}>
        Show me
      </ShowUnlessUserHasKeyToAnyLock>)
    expect(wrapper.queryByText('Show me')).not.toBe(null)
  })

  test('should not show the children if there is a valid key', () => {
    const locks = [{
      address: '0x123',
    }]
    const keys = {
      '123': {
        lockAddress: '0x123',
        expiration: (new Date().getTime() / 1000) + 60 * 60, // Expires in one hour
      },
    }

    const wrapper = rtl.render(
      <ShowUnlessUserHasKeyToAnyLock locks={locks} keys={keys}>
        Hide me
      </ShowUnlessUserHasKeyToAnyLock>)
    expect(wrapper.queryByText('')).not.toBe(null)
  })
})
