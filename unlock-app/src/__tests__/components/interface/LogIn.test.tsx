import React from 'react'
import * as rtl from '@testing-library/react'
import LogIn from '../../../components/interface/LogIn'

describe.skip('LogIn', () => {
  it('should call loginCredentials when the form is submitted', () => {
    expect.assertions(1)

    const emailAddress = 'miku@vocaloid.co.jp'
    const password = 'guest'

    const { getByDisplayValue, getByLabelText } = rtl.render(
      <LogIn network={1} />
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
    const { getByText } = rtl.render(<LogIn network={1} />)

    getByText('Sign Up')
  })
})
