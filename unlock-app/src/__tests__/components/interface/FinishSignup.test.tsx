import React from 'react'
import * as rtl from 'react-testing-library'
import {
  FinishSignup,
  Credentials, // eslint-disable-line no-unused-vars
} from '../../../components/interface/FinishSignup'

let signupCredentials = jest.fn((credentials: Credentials) => credentials)

describe('FinishSignup', () => {
  beforeEach(() => {
    signupCredentials = jest.fn((credentials: Credentials) => credentials)
  })

  it('should call signupCredentials with the provided email and pass', () => {
    expect.assertions(1)

    const emailAddress = 'geoff@bitconnect.gov'
    const password = 'guest'

    const { getByLabelText, getByDisplayValue } = rtl.render(
      <FinishSignup
        emailAddress={emailAddress}
        signupCredentials={signupCredentials}
      />
    )

    const inputs = [
      getByLabelText('Password'),
      getByLabelText('Confirm Password'),
    ]
    const submit = getByDisplayValue('Submit')

    inputs.forEach(input => {
      rtl.fireEvent.change(input, { target: { value: 'guest' } })
    })

    rtl.fireEvent.click(submit)
    expect(signupCredentials).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAddress,
        password,
      })
    )
  })
})
