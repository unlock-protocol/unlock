import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Account } from '../../components/Account'

describe('Account Component', () => {

  const account = {
    address: '0xdeadbeef',
    balance: '1000',
  }
  const showAccountPicker = jest.fn()
  const wrapper = shallow(<Account
    account={account}
    showAccountPicker={showAccountPicker} />)

  it('shows the current account\'s public key', () => {
    expect(wrapper.find('span').first().text()).toEqual('0xdeadbeef')
  })

  it('shows the current account\'s balance', () => {
    expect(wrapper.find('span').at(1).text()).toEqual('Ξ 1000')
  })

  it('shows a button to logout', () => {
    const button = wrapper.find('button')
    expect(button.text()).toEqual('Sign out')
    button.simulate('click')
    expect(showAccountPicker).toBeCalledWith()
  })

})