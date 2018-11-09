import React from 'react'
import { shallow } from 'enzyme'

import {ShowUnlessUserHasKeyToAnyLock} from '../../../components/lock/ShowUnlessUserHasKeyToAnyLock'

describe('ShowUnlessUserHasKeyToAnyLock', () => {

  it('should show the children if there is no key for this lock', () => {
    const locks = [{
      address: '0x123',
    }]
    const keys = {
      '123': {
        lockAddress: '0x456',
      },
    }

    const wrapper = shallow(
      <ShowUnlessUserHasKeyToAnyLock locks={locks} keys={keys}>
        Show me
      </ShowUnlessUserHasKeyToAnyLock>)

    expect(wrapper.text()).toEqual('Show me')
  })

  it('should show the children if there is no valid key for this lock', () => {
    const locks = [{
      address: '0x123',
    }]
    const keys = {
      '123': {
        lockAddress: '0x123',
        expiration: (new Date().getTime() / 1000) - 60*60, // Expired one hour ago
      },
    }

    const wrapper = shallow(
      <ShowUnlessUserHasKeyToAnyLock locks={locks} keys={keys}>
        Show me
      </ShowUnlessUserHasKeyToAnyLock>)
    expect(wrapper.text()).toEqual('Show me')
  })

  it('should not show the children if there is a valid key', () => {
    const locks = [{
      address: '0x123',
    }]
    const keys = {
      '123': {
        lockAddress: '0x123',
        expiration: (new Date().getTime() / 1000) + 60 * 60, // Expires in one hour
      },
    }

    const wrapper = shallow(
      <ShowUnlessUserHasKeyToAnyLock locks={locks} keys={keys}>
        Hide me
      </ShowUnlessUserHasKeyToAnyLock>)
    expect(wrapper.text()).toEqual('')
  })
})
