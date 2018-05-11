import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Authenticate } from '../../components/Authenticate'

describe('Authenticate Component', () => {

  const loadAccount = jest.fn()
  const hideAccountPicker = jest.fn()

  const wrapper = shallow(<Authenticate loadAccount={loadAccount} hideAccountPicker={hideAccountPicker} />)

  it('shows a button to close', () => {
    const closeButton = wrapper.find('button').at(1)
    expect(closeButton.text()).toEqual('Cancel')
    closeButton.simulate('click')
    expect(hideAccountPicker).toBeCalledWith()
  })

  it('shows a button sign in with a private key which uses the private key input value', () => {
    const privateKey = '0xdeadbeef'

    const inputField = wrapper.find('input').first()
    inputField.simulate('change', { target: { value: privateKey } })

    const importAccountButton = wrapper.find('button').at(0)
    expect(importAccountButton.text()).toEqual('Sign in')
    importAccountButton.simulate('click')
    expect(loadAccount).toBeCalledWith(privateKey)
  })

})