import React from 'react'
import * as rtl from 'react-testing-library'
import {
  SignUp,
  mapDispatchToProps,
} from '../../../components/interface/SignUp'
import { SIGNUP_EMAIL } from '../../../actions/signUp'

let wrapper: rtl.RenderResult<typeof rtl.queries>
let signupEmail: (email: string) => any

afterEach(rtl.cleanup)

describe('Sign Up Page', () => {
  describe('mapDispatchToProps', () => {
    it('should map the dispatch to the props', () => {
      expect.assertions(2)
      const emailAddress = 'send@mem.es'
      const dispatch = jest.fn(event => {
        expect(event.type).toBe(SIGNUP_EMAIL)
        expect(event.emailAddress).toBe(emailAddress)
      })
      const { signupEmail } = mapDispatchToProps(dispatch)
      signupEmail(emailAddress)
    })
  })

  beforeEach(() => {
    signupEmail = jest.fn((email: string) => email)
    wrapper = rtl.render(<SignUp signupEmail={signupEmail} />)
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
