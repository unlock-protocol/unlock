import React from 'react'
import * as rtl from '@testing-library/react'
import {
  mapDispatchToProps,
  FinishSignup,
} from '../../../components/interface/FinishSignup'
import { Credentials } from '../../../components/interface/SetPassword'

let signupCredentials = jest.fn((credentials: Credentials) => credentials)

describe('FinishSignup', () => {
  beforeEach(() => {
    signupCredentials = jest.fn((credentials: Credentials) => credentials)
  })

  it('should call signupCredentials with the provided email and pass', () => {
    expect.assertions(1)

    const emailAddress = 'geoff@bitconnect.gov'
    const password = 'password1'

    const { getByLabelText, getByDisplayValue, getByText } = rtl.render(
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

    inputs.forEach((input) => {
      rtl.fireEvent.change(input, { target: { value: password } })
    })

    rtl.fireEvent.click(submit)
    expect(signupCredentials).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAddress,
        password,
      })
    )

    // Also it should go to the loading spinner when you submit
    getByText('Creating Account...')
  })

  describe('mapDispatchToProps', () => {
    it('maps the dispatch to the props', () => {
      expect.assertions(1)
      expect(mapDispatchToProps((arg: any) => arg)).toEqual(
        expect.objectContaining({
          signupCredentials: expect.any(Function),
        })
      )
    })

    it('dispatches a signupCredentials action', () => {
      expect.assertions(1)
      const dispatch = jest.fn()
      const { signupCredentials } = mapDispatchToProps(dispatch)
      const credentials = {
        emailAddress: 'c@c.c',
        password: 'guest',
      }
      signupCredentials(credentials)

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          emailAddress: credentials.emailAddress,
          password: credentials.password,
        })
      )
    })
  })
})
