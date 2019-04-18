import React from 'react'
import * as rtl from 'react-testing-library'
import { LogIn } from '../../../components/interface/LogIn'
// eslint-disable-next-line no-unused-vars
import { Credentials } from '../../../actions/login'

let loginCredentials: (c: Credentials) => any

describe('LogIn', () => {
  beforeEach(() => {
    loginCredentials = jest.fn((c: Credentials) => c)
  })

  it('should call toggleSignup when the link is clicked', () => {
    expect.assertions(1)

    const toggleSignup = jest.fn()

    const { getByText } = rtl.render(
      <LogIn toggleSignup={toggleSignup} loginCredentials={loginCredentials} />
    )

    const signUp = getByText('Sign up here.')
    rtl.fireEvent.click(signUp)
    expect(toggleSignup).toHaveBeenCalled()
  })

  it('should call loginCredentials when the form is submitted', () => {
    expect.assertions(1)

    const emailAddress = 'miku@vocaloid.co.jp'
    const password = 'guest'

    const { getByDisplayValue, getByLabelText } = rtl.render(
      <LogIn toggleSignup={() => {}} loginCredentials={loginCredentials} />
    )

    const emailInput = getByLabelText('Email Address')
    rtl.fireEvent.change(emailInput, { target: { value: emailAddress } })
    const passwordInput = getByLabelText('Password')
    rtl.fireEvent.change(passwordInput, { target: { value: password } })

    const submit = getByDisplayValue('Submit')
    rtl.fireEvent.click(submit)

    expect(loginCredentials).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAddress,
        password,
      })
    )
  })
})
