import React from 'react'
import * as rtl from 'react-testing-library'
import {
  ChangePassword,
  validatePassword,
  passwordErrors,
  mapDispatchToProps,
} from '../../../../components/interface/user-account/ChangePassword'

describe('ChangePassword component', () => {
  describe('Password validation', () => {
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
    it('should produce an object containing a changePassword function', () => {
      expect.assertions(1)
      const dispatch = () => {}

      expect(mapDispatchToProps(dispatch)).toEqual(
        expect.objectContaining({
          changePassword: expect.any(Function),
        })
      )
    })
  })

  describe('Component', () => {
    let changePassword: (oldPassword: string, newPassword: string) => any
    let currentPasswordInput: HTMLElement
    let newPasswordInput: HTMLElement
    let confirmNewPasswordInput: HTMLElement
    let submitButton: HTMLElement
    let wrapper: any
    beforeEach(() => {
      changePassword = jest.fn()

      wrapper = rtl.render(<ChangePassword changePassword={changePassword} />)

      currentPasswordInput = wrapper.getByPlaceholderText(
        'Enter your current password'
      )
      newPasswordInput = wrapper.getByPlaceholderText(
        'Enter your desired new password'
      )
      confirmNewPasswordInput = wrapper.getByPlaceholderText(
        'Confirm your desired new password'
      )
      submitButton = wrapper.getByText('Update Password')
    })
    it('should dispatch an event when submit is clicked (valid form)', () => {
      expect.assertions(1)
      rtl.fireEvent.change(currentPasswordInput, {
        target: { value: 'a valid password' },
      })

      const inputs = [newPasswordInput, confirmNewPasswordInput]
      inputs.forEach((input: HTMLElement) => {
        rtl.fireEvent.change(input, {
          target: { value: 'a new valid password' },
        })
      })

      rtl.fireEvent.click(submitButton)

      expect(changePassword).toHaveBeenCalledWith(
        'a valid password',
        'a new valid password'
      )
      wrapper.getByText('Submitted')
    })

    it('should not dispatch an event when submit is clicked (invalid form)', () => {
      expect.assertions(1)
      rtl.fireEvent.change(currentPasswordInput, { target: { value: 'xx' } })

      const inputs = [newPasswordInput, confirmNewPasswordInput]
      inputs.forEach((input: HTMLElement) => {
        rtl.fireEvent.change(input, { target: { value: 'yy' } })
      })

      rtl.fireEvent.click(submitButton)

      expect(changePassword).not.toHaveBeenCalled()
      wrapper.getByText(passwordErrors.MID_LENGTH)
    })
  })
})
