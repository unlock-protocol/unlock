import React from 'react'
import * as rtl from 'react-testing-library'
import {
  KeyPurchaseConfirmation,
  mapDispatchToProps,
  mapStateToProps,
} from '../../../../components/interface/user-account/KeyPurchaseConfirmation'
import { PurchaseData } from '../../../../actions/user'

describe('KeyPurchaseConfirmation', () => {
  describe('component', () => {
    it('calls signPurchaseData on submit', () => {
      expect.assertions(1)
      const signPurchaseData = jest.fn((_: PurchaseData) => true)
      const wrapper = rtl.render(
        <KeyPurchaseConfirmation
          emailAddress="gaben@valve.hats"
          signPurchaseData={signPurchaseData}
        />
      )
      const submitButton = wrapper.container.getElementsByTagName('button')[0]
      if (submitButton) {
        rtl.fireEvent.click(submitButton)
      }
      expect(signPurchaseData).toHaveBeenCalled()
    })
  })

  describe('mapDispatchToProps', () => {
    it('should produce an object containing a signPurchaseData function', () => {
      expect.assertions(1)
      const dispatch = jest.fn()

      expect(mapDispatchToProps(dispatch)).toEqual(
        expect.objectContaining({
          signPurchaseData: expect.any(Function),
        })
      )
    })
  })

  describe('mapStateToProps', () => {
    it('returns the email if in state', () => {
      expect.assertions(1)
      const state = {
        account: {
          emailAddress: 'gaben@valve.hats',
        },
      }

      expect(mapStateToProps(state)).toEqual({
        emailAddress: 'gaben@valve.hats',
      })
    })
  })
})
