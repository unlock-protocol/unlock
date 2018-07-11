import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { WithdrawButton } from '../../../components/creator/Lock'

describe('Lock', () => {

})

describe('LockOwner', () => {

})

describe('WithdrawButton', () => {

  describe('when the current user is the lock owner', () => {

    const account = {}
    const lock = {}
    const withdrawFromLock = jest.fn()
    const wrapper = shallow(<WithdrawButton account={account} lock={lock} withdrawFromLock={withdrawFromLock} />)

    it('should show the Withdraw button', () => {
      expect(wrapper.text()).toEqual('Withdraw')
    })

    it('should invoke withdrawFromLock when clicked', () => {
      const withdrawButton = wrapper.find('button')
      withdrawButton.simulate('click')
      expect(withdrawFromLock).toHaveBeenCalledWith(lock)
    })
  })

  it('should show nothing if the owner of the lock is the current user', () => {
    const account = {
      address: '0x123',
    }
    const lock = {
      owner: '0xabc',
    }
    const withdrawFromLock = jest.fn()
    const wrapper = shallow(<WithdrawButton account={account} lock={lock} withdrawFromLock={withdrawFromLock} />)
    const withdrawButton = wrapper.find('button')
    expect(wrapper.text()).toEqual('')
    expect(withdrawButton.exists()).toBe(false)
  })
})

describe('KeyReleaseMechanism', () => {

})