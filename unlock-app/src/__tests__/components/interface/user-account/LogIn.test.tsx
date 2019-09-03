import React from 'react'
import * as rtl from 'react-testing-library'
import { LogIn } from '../../../../components/interface/user-account/LogIn'
// eslint-disable-next-line no-unused-vars
import { Credentials } from '../../../../actions/user'
import { WarningError } from '../../../../utils/Error'

let loginCredentials: (c: Credentials) => any
let toggleSignup: () => any
let close: (e: any) => void
let errors: WarningError[]

describe('LogIn', () => {
  beforeEach(() => {
    loginCredentials = jest.fn((c: Credentials) => c)
    toggleSignup = jest.fn()
    close = jest.fn()
    errors = []
  })

  it('should call toggleSignup when the link is clicked', () => {
    expect.assertions(1)

    const { getByText } = rtl.render(
      <LogIn
        toggleSignup={toggleSignup}
        loginCredentials={loginCredentials}
        errors={errors}
        close={close}
      />
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
      <LogIn
        toggleSignup={toggleSignup}
        loginCredentials={loginCredentials}
        errors={errors}
        close={close}
      />
    )

    const emailInput = getByLabelText('Email')
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

  it('should transition to a loading state when the form is submitted', () => {
    expect.assertions(1)

    const { getByText, getByDisplayValue } = rtl.render(
      <LogIn
        toggleSignup={toggleSignup}
        loginCredentials={loginCredentials}
        errors={errors}
        close={close}
      />
    )

    // Should not already be in the loading state
    expect(() => getByText('Logging In...')).toThrow()

    const submit = getByDisplayValue('Submit')
    rtl.fireEvent.click(submit)

    getByText('Logging In...')
  })

  it('should show SignupSuccess when there is an account in state', () => {
    expect.assertions(0)

    const account = {
      address: '0x123abc',
      balance: '0',
    }

    const { getByText } = rtl.render(
      <LogIn
        toggleSignup={toggleSignup}
        loginCredentials={loginCredentials}
        account={account}
        errors={errors}
        close={close}
      />
    )

    getByText('Sign Up')
  })
})
