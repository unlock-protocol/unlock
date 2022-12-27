import React from 'react'
import * as rtl from '@testing-library/react'
import { FinishSignup } from '../../../components/interface/FinishSignup'
import { vi } from 'vitest'

let signupCredentials = vi.fn((credentials: any) => credentials)

describe('FinishSignup', () => {
  beforeEach(() => {
    signupCredentials = vi.fn((credentials: any) => credentials)
  })

  it.skip('should call signupCredentials with the provided email and pass', () => {
    expect.assertions(1)

    const emailAddress = 'geoff@bitconnect.gov'
    const password = 'password1'

    const { getByLabelText, getByDisplayValue, getByText } = rtl.render(
      <FinishSignup onSuccess={vi.fn()} emailAddress={emailAddress} />
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
})
