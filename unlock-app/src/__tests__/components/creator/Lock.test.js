import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { WithdrawButton, KeyReleaseMechanism, LockOwner } from '../../../components/creator/Lock'

describe('Lock', () => {

})

describe('LockOwner', () => {
  const account = {
    address: '0x123',
  }
  const owner = '0xabc'

  it('should show the address of the lock owner', () => {
    const wrapper = shallow(<LockOwner owner={owner} account={account} />)
    expect(wrapper.text()).toEqual('0xabc')
  })

  it('should show "me" if the current user is the lock owner', () => {
    const wrapper = shallow(<LockOwner owner={account.address} account={account} />)
    expect(wrapper.text()).toEqual('Me 0x123')
  })
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
  it('should display Public when the mechanism is 0', () => {
    const wrapper = shallow(<KeyReleaseMechanism mechanism={'0'} />)
    expect(wrapper.text()).toEqual('Public')
  })

  it('should display Permissioned when the mechanism is 1', () => {
    const wrapper = shallow(<KeyReleaseMechanism mechanism={'1'} />)
    expect(wrapper.text()).toEqual('Permissioned')
  })

  it('should display Private when the mechanism is 2', () => {
    const wrapper = shallow(<KeyReleaseMechanism mechanism={'2'} />)
    expect(wrapper.text()).toEqual('Private')
  })
})