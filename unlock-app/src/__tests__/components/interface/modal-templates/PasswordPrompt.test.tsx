import React from 'react'
import * as rtl from 'react-testing-library'
import { PasswordPrompt } from '../../../../components/interface/modal-templates'
import { dismissPasswordPrompt } from '../../../../actions/fullScreenModals'
import { GOT_PASSWORD, gotPassword } from '../../../../actions/user'

let dispatch: (_: any) => boolean

describe('Password Prompt', () => {
  beforeEach(() => {
    dispatch = jest.fn((_: any) => true)
  })

  it('should dismiss when the cancel button is clicked', () => {
    expect.assertions(2)

    const { getByText } = rtl.render(<PasswordPrompt dispatch={dispatch} />)

    const cancelButton = getByText('Cancel')

    rtl.fireEvent.click(cancelButton)

    expect(dispatch).toHaveBeenCalledWith(dismissPasswordPrompt())
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: GOT_PASSWORD,
      })
    )
  })

  it('should submit a password and then dismiss when the submit buttton is clicked', () => {
    expect.assertions(2)

    const password = 'guest'
    const { getByText, container } = rtl.render(
      <PasswordPrompt dispatch={dispatch} />
    )

    const passwordInput = container.querySelector('input')
    if (passwordInput) {
      // This should always be here, but TypeScript requires that we check first
      rtl.fireEvent.change(passwordInput, { target: { value: password } })
    }

    const submitButton = getByText('Submit')
    rtl.fireEvent.click(submitButton)

    expect(dispatch).toHaveBeenNthCalledWith(1, gotPassword(password))
    expect(dispatch).toHaveBeenNthCalledWith(2, dismissPasswordPrompt())
  })
})
