import React from 'react'
import * as rtl from '@testing-library/react'
import SignUp from '../../../components/interface/SignUp'
import doNothing from '../../../utils/doNothing'
import { vi } from 'vitest'

const mockWedlocksUtil = { verifyEmailSignature: vi.fn() }

vi.mock('../../../utils/wedlocks', () => {
  return vi.fn().mockImplementation(() => {
    return mockWedlocksUtil
  })
})

let wrapper: rtl.RenderResult<typeof rtl.queries>
let signupEmail: (email: string) => any

afterEach(rtl.cleanup)

describe.skip('Sign Up Page', () => {
  beforeEach(() => {
    signupEmail = vi.fn((email: string) => email)
    wrapper = rtl.render(<SignUp showLogin={doNothing} />)
  })

  it('should update the input field on change', () => {
    expect.assertions(1)
    const email = 'snsv@computer.net'
    const { getByPlaceholderText } = wrapper
    const inputNode = getByPlaceholderText(
      'Enter your email to get started'
    ) as HTMLInputElement
    rtl.fireEvent.change(inputNode, { target: { value: email } })
    expect(inputNode.value).toBe(email)
  })

  it('should dispatch a SIGNUP_EMAIL action and hide the form when submit is clicked', () => {
    expect.assertions(3)
    const { container, getByText } = wrapper
    const submitButton = container.querySelector('input[type="submit"]')
    expect(submitButton).not.toBeNull()
    expect(signupEmail).not.toHaveBeenCalled()
    if (submitButton) {
      rtl.fireEvent.click(submitButton)
      expect(signupEmail).toHaveBeenCalledWith('')
      getByText('Please check your email')
    }
  })
})
