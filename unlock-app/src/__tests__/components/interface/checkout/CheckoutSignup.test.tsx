import React from 'react'
import * as rtl from '@testing-library/react'
import { CheckoutSignup } from '../../../../components/interface/checkout/CheckoutSignup'

let signupEmail: jest.Mock<any, any>
let toggleSignup: jest.Mock<any, any>

describe('CheckoutSignup', () => {
  describe('Component', () => {
    const emailAddress = 'user@email.com'

    beforeEach(() => {
      signupEmail = jest.fn()
      toggleSignup = jest.fn()
    })

    it('renders normally', () => {
      expect.assertions(1)

      const { getAllByText } = rtl.render(
        <CheckoutSignup signupEmail={signupEmail} toggleSignup={toggleSignup} />
      )

      const result = getAllByText('Sign Up')
      // One for heading, one for button
      expect(result).toHaveLength(2)
    })

    it('submits on click', async () => {
      expect.assertions(1)

      const { getByText, getByLabelText, getAllByText } = rtl.render(
        <CheckoutSignup signupEmail={signupEmail} toggleSignup={toggleSignup} />
      )

      const emailInput = getByLabelText('Email Address')
      const submitButton = getAllByText('Sign Up')[1]

      await rtl.act(async () => {
        rtl.fireEvent.change(emailInput, { target: { value: emailAddress } })
        rtl.fireEvent.click(submitButton)
      })

      expect(signupEmail).toHaveBeenCalledWith(emailAddress)
      getByText('Please check your email')
    })
  })
})
