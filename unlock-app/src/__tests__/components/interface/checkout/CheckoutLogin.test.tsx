import React from 'react'
import * as rtl from '@testing-library/react'
import {
  CheckoutLogin,
  mapStateToProps,
} from '../../../../components/interface/checkout/CheckoutLogin'
import { WarningError } from '../../../../utils/Error'

const warningError: WarningError = {
  level: 'Warning',
  kind: 'Transaction',
  message: 'Something happened :c',
}

const storageWarning: WarningError = {
  level: 'Warning',
  kind: 'Storage',
  message: 'Something happened :c',
}

const errors = [storageWarning]
let close: jest.Mock<any, any>
let loginCredentials: jest.Mock<any, any>
let toggleSignup: jest.Mock<any, any>

describe('CheckoutLogin', () => {
  describe('Component', () => {
    const emailAddress = 'user@email.com'
    const password = 'password1'

    beforeEach(() => {
      close = jest.fn()
      loginCredentials = jest.fn()
      toggleSignup = jest.fn()
    })

    it('renders normally', () => {
      expect.assertions(1)

      const { getAllByText } = rtl.render(
        <CheckoutLogin
          errors={[]}
          close={close}
          loginCredentials={loginCredentials}
          toggleSignup={toggleSignup}
        />
      )

      const results = getAllByText('Log In')
      // One for heading, one more for button
      expect(results).toHaveLength(2)
    })

    it('renders the retry button when there are errors', async () => {
      expect.assertions(1)

      const { getByText, getByLabelText } = rtl.render(
        <CheckoutLogin
          errors={errors}
          close={close}
          loginCredentials={loginCredentials}
          toggleSignup={toggleSignup}
        />
      )

      const emailInput = getByLabelText('Email Address')
      const passwordInput = getByLabelText('Password')
      const retryButton = getByText('Retry')

      await rtl.act(async () => {
        rtl.fireEvent.change(emailInput, { target: { value: emailAddress } })
        rtl.fireEvent.change(passwordInput, { target: { value: password } })
        rtl.fireEvent.click(retryButton)
      })

      expect(loginCredentials).toHaveBeenCalledWith({ emailAddress, password })
    })

    it('moves into a loading state when submitting the form', async () => {
      expect.assertions(1)

      const { getByLabelText, getAllByText, getByText } = rtl.render(
        <CheckoutLogin
          errors={[]}
          close={close}
          loginCredentials={loginCredentials}
          toggleSignup={toggleSignup}
        />
      )

      const emailInput = getByLabelText('Email Address')
      const passwordInput = getByLabelText('Password')
      const loginButton = getAllByText('Log In')[1]

      await rtl.act(async () => {
        rtl.fireEvent.change(emailInput, { target: { value: emailAddress } })
        rtl.fireEvent.change(passwordInput, { target: { value: password } })
        rtl.fireEvent.click(loginButton)
      })

      expect(loginCredentials).toHaveBeenCalledWith({ emailAddress, password })
      getByText('Loading')
    })
  })

  describe('mapStateToProps', () => {
    it('provides the expected props', () => {
      expect.assertions(1)

      expect(
        mapStateToProps({ errors: [storageWarning, warningError] })
      ).toEqual({ errors: [storageWarning] })
    })
  })
})
