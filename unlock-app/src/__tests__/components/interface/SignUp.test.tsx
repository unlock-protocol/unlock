import React from 'react'
import * as rtl from 'react-testing-library'
import { SignUp } from '../../../components/interface/SignUp'

let wrapper: rtl.RenderResult<typeof rtl.queries>
let toggleSignup: any
let signupEmail: (email: string) => any

afterEach(rtl.cleanup)
describe('Sign Up Page', () => {
  beforeEach(() => {
    toggleSignup = jest.fn()
    signupEmail = jest.fn((email: string) => email)
    wrapper = rtl.render(
      <SignUp toggleSignUp={toggleSignup} signupEmail={signupEmail} />
    )
  })

  it('should dispatch a SIGNUP_EMAIL action and hide the form when submit is clicked', () => {
    expect.assertions(3)
    const { container, getByText } = wrapper
    const submitButton = container.querySelector('input[type="submit"]')
    expect(submitButton).not.toBeNull()
    expect(signupEmail).not.toHaveBeenCalled()
    if (submitButton) {
      rtl.fireEvent.click(submitButton)
      expect(signupEmail).toHaveBeenCalled()
      getByText('Please check your email')
    }
  })
})
