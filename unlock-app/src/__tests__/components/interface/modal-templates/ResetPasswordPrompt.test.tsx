import React from 'react'
import * as rtl from 'react-testing-library'
import { ResetPasswordPrompt } from '../../../../components/interface/modal-templates/ResetPasswordPrompt'
import { dismissResetPasswordPrompt } from '../../../../actions/fullScreenModals'
import { changePassword } from '../../../../actions/user'

let dispatch: (_: any) => any
const email = 'geoff@bitconnect.gov'

describe('Reset Password Prompt', () => {
  beforeEach(() => {
    dispatch = jest.fn((_: any) => true) // eslint-disable-line no-unused-vars
  })

  it("should render a form including user's email address", () => {
    // No assertions, getByDisplayValue will throw if this element is not present.
    expect.assertions(0)

    const { getByDisplayValue } = rtl.render(
      <ResetPasswordPrompt email={email} dispatch={dispatch} />
    )

    getByDisplayValue(email)
  })

  it('should dispatch a password change action when submitted', () => {
    expect.assertions(2)
    const oldPassword = 'guest'
    const newPassword = 'gU35tp@55word'

    const { getByPlaceholderText, getByText } = rtl.render(
      <ResetPasswordPrompt email={email} dispatch={dispatch} />
    )

    const passwordInput = getByPlaceholderText('Current Password')
    const newInputs = [
      getByPlaceholderText('New Password'),
      getByPlaceholderText('Confirm New Password'),
    ]

    rtl.fireEvent.change(passwordInput, { target: { value: oldPassword } })

    newInputs.forEach(input => {
      rtl.fireEvent.change(input, { target: { value: newPassword } })
    })

    const submitButton = getByText('Submit')
    rtl.fireEvent.click(submitButton)

    expect(dispatch).toHaveBeenCalledWith(
      changePassword(oldPassword, newPassword)
    )
    expect(dispatch).toHaveBeenCalledWith(dismissResetPasswordPrompt())
  })

  it('should do nothing if submit is clicked without valid input', () => {
    expect.assertions(1)

    const { getByText } = rtl.render(
      <ResetPasswordPrompt email={email} dispatch={dispatch} />
    )

    const submitButton = getByText('Submit')

    rtl.fireEvent.click(submitButton)

    expect(dispatch).not.toHaveBeenCalled()
  })

  it('should dismiss the prompt if cancel button is clicked', () => {
    expect.assertions(2)

    const { getByText } = rtl.render(
      <ResetPasswordPrompt email={email} dispatch={dispatch} />
    )

    const cancelButton = getByText('Cancel')

    rtl.fireEvent.click(cancelButton)

    expect(dispatch).toHaveBeenCalledWith(dismissResetPasswordPrompt())
    expect(dispatch).toHaveBeenCalledTimes(1)
  })
})
