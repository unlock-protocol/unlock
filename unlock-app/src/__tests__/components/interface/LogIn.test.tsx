import React from 'react'
import * as rtl from '@testing-library/react'
import LogIn from '../../../components/interface/LogIn'
import doNothing from '../../../utils/doNothing'

describe.skip('LogIn', () => {
  it('should call toggleSignup when the link is clicked', () => {
    expect.assertions(1)

    const toggleSignup = jest.fn()

    const { getByText } = rtl.render(
      <LogIn network={1} onProvider={doNothing} showSignup={toggleSignup} />
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
      <LogIn network={1} onProvider={doNothing} showSignup={() => {}} />
    )

    const emailInput = getByLabelText('Email Address')
    rtl.fireEvent.change(emailInput, { target: { value: emailAddress } })
    const passwordInput = getByLabelText('Password')
    rtl.fireEvent.change(passwordInput, { target: { value: password } })

    const submit = getByDisplayValue('Submit')
    rtl.fireEvent.click(submit)
  })

  it('should show SignupSuccess when there is an account in state', () => {
    expect.assertions(0)

    const toggleSignup = jest.fn()

    const { getByText } = rtl.render(
      <LogIn network={1} onProvider={doNothing} showSignup={toggleSignup} />
    )

    getByText('Sign Up')
  })
})
