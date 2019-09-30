import React from 'react'
import * as rtl from 'react-testing-library'
import {
  LogIn,
  mapDispatchToProps,
  mapStateToProps,
} from '../../../../components/interface/user-account/LogIn'
// eslint-disable-next-line no-unused-vars
import { Credentials } from '../../../../actions/user'
import Errors, { WarningError, UnlockError } from '../../../../utils/Error'

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

  it('should show allow for reset and retry when there is an error', () => {
    expect.assertions(2)

    const errors = [Errors.LogIn.Warning('Failed to decrypt private key.')]

    const { getByText } = rtl.render(
      <LogIn
        toggleSignup={toggleSignup}
        loginCredentials={loginCredentials}
        errors={errors}
        close={close}
      />
    )

    // There's an error, so the red button should be visible
    const resetButton = getByText('Retry Login')

    rtl.fireEvent.click(resetButton)

    // After clicking, it should close the errors
    expect(close).toHaveBeenCalledWith(errors[0])
    // And then submit the login request
    expect(loginCredentials).toHaveBeenCalled()
  })

  describe('mapStateToProps', () => {
    it('should include the account and relevant errors in state', () => {
      expect.assertions(1)

      const errors: UnlockError[] = [
        {
          level: 'Warning',
          kind: 'Storage',
          message: 'An error occurred',
        },
        {
          level: 'Fatal',
          kind: 'LogIn',
          message: 'An error occurred',
        },
        {
          level: 'Warning',
          kind: 'LogIn',
          message: 'An error occurred',
        },
        {
          level: 'Fatal',
          kind: 'Storage',
          message: 'An error occurred',
        },
      ]

      const account = {
        address: '',
        balance: '',
      }

      const state = {
        account,
        errors,
      }

      expect(mapStateToProps(state)).toEqual({
        account,
        errors: [
          {
            level: 'Warning',
            kind: 'Storage',
            message: 'An error occurred',
          },
          {
            level: 'Warning',
            kind: 'LogIn',
            message: 'An error occurred',
          },
        ],
      })
    })
  })

  describe('mapDispatchToProps', () => {
    let dispatch: any
    let props: any
    beforeEach(() => {
      dispatch = jest.fn()
      props = mapDispatchToProps(dispatch)
    })
    it('should create a loginCredentials function', () => {
      expect.assertions(1)

      const emailAddress = 'com@com.com'
      const password = 'guest'

      props.loginCredentials({
        emailAddress,
        password,
      })

      expect(dispatch).toHaveBeenCalledWith({
        type: 'login/GOT_CREDENTIALS',
        emailAddress,
        password,
      })
    })
    it('should create a close function', () => {
      expect.assertions(1)

      const error: UnlockError = {
        level: 'Warning',
        kind: 'Storage',
        message: 'An error occurred',
      }

      props.close(error)

      expect(dispatch).toHaveBeenCalledWith({
        type: 'error/RESET_ERROR',
        error,
      })
    })
  })
})
