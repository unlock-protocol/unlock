import React from 'react'
import * as rtl from '@testing-library/react'
import {
  passwordErrors,
  validatePassword,
  SetPassword,
  Credentials,
} from '../../../components/interface/SetPassword'

let onSubmit = jest.fn((credentials: Credentials) => credentials)

describe('SetPassword', () => {
  beforeEach(() => {
    onSubmit = jest.fn((credentials: Credentials) => credentials)
  })

  it('should call onSubmit with the provided email and pass', () => {
    expect.assertions(1)

    const emailAddress = 'geoff@bitconnect.gov'
    const password = 'password1'

    const { getByLabelText, getByDisplayValue, getByText } = rtl.render(
      <SetPassword emailAddress={emailAddress} onSubmit={onSubmit} />
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
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAddress,
        password,
      })
    )

    // Also it should go to the loading spinner when you submit
    getByText('Creating Account...')
  })

  it('but not if the password does not match its confirmation', () => {
    expect.assertions(1)

    const emailAddress = 'geoff@bitconnect.gov'
    const password = 'AVeryGoodPassword'

    const { getByLabelText, getByDisplayValue } = rtl.render(
      <SetPassword emailAddress={emailAddress} onSubmit={onSubmit} />
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
    expect(onSubmit).not.toHaveBeenCalled()
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
})
