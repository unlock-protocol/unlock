import React from 'react'
import * as rtl from 'react-testing-library'
import {
  passwordErrors,
  mapDispatchToProps,
  validatePassword,
  FinishSignup,
  Credentials,
} from '../../../components/interface/FinishSignup'

let signupCredentials = jest.fn((credentials: Credentials) => credentials)

describe('FinishSignup', () => {
  beforeEach(() => {
    signupCredentials = jest.fn((credentials: Credentials) => credentials)
  })

  it('should call signupCredentials with the provided email and pass', () => {
    expect.assertions(1)

    const emailAddress = 'geoff@bitconnect.gov'
    const password = 'password1'

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
      rtl.fireEvent.change(input, { target: { value: password } })
    })

    rtl.fireEvent.click(submit)
    expect(signupCredentials).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAddress,
        password,
      })
    )
  })

  it('but not if the password does not match its confirmation', () => {
    expect.assertions(1)

    const emailAddress = 'geoff@bitconnect.gov'
    const password = 'AVeryGoodPassword'

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

    inputs.forEach((input, i) => {
      rtl.fireEvent.change(input, { target: { value: password + i } })
    })

    rtl.fireEvent.click(submit)
    expect(signupCredentials).not.toHaveBeenCalled()
  })

  describe('validatePassword', () => {
    it('should not allow blank passwords', () => {
      expect.assertions(1)
      expect(validatePassword('', '')).toEqual([
        passwordErrors.EMPTY,
        passwordErrors.MID_LENGTH,
      ])
    })

    it('should not allow passwords that are different from their confirmations', () => {
      expect.assertions(1)
      expect(
        validatePassword('AVeryGoodPassword', 'PGeryVoodAassword')
      ).toEqual([passwordErrors.NO_MATCH])
    })
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
  })
})
