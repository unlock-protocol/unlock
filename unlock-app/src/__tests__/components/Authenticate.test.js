import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Authenticate } from '../../components/Authenticate'

describe('Authenticate Component', () => {

  const createAccount = jest.fn()
  const loadAccount = jest.fn()

  const wrapper = shallow(<Authenticate createAccount={createAccount} loadAccount={loadAccount} />)

  it('shows a button to create an account', () => {
    const createAccountButton = wrapper.find('button').first()
    expect(createAccountButton.text()).toEqual('Create account')
    createAccountButton.simulate('click')
    expect(createAccount).toBeCalledWith()
  })

  it('shows a button sign in with a private key which uses the private key input value', () => {
    const privateKey = '0xdeadbeef'

    const inputField = wrapper.find('input').first()
    inputField.simulate('change', { target: { value: privateKey } })

    const importAccountButton = wrapper.find('button').at(1)
    expect(importAccountButton.text()).toEqual('Sign in')
    importAccountButton.simulate('click')
    expect(loadAccount).toBeCalledWith(privateKey)
  })

})