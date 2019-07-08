import React from 'react'
import * as rtl from 'react-testing-library'
import { Key, Lock } from '../../../../unlockTypes'
import {
  KeyPurchaseConfirmation,
  mapDispatchToProps,
  mapStateToProps,
} from '../../../../components/interface/user-account/KeyPurchaseConfirmation'
import { PurchaseData } from '../../../../actions/user'

const key: Key = {
  expiration: 123456789000,
  transactions: [],
  status: 'confirming',
  confirmations: 0,
  lock: 'not a real address',
  owner: null,
}
const lock: Lock = {
  name: 'My ERC20 Lock',
  address: 'not a real address',
  keyPrice: '0.2',
  expirationDuration: 123456789000,
  currencyContractAddress: 'not a real currency contract address',
  key,
}
const emailAddress = 'gaben@valve.hats'
const address = '0xe29ec42F0b620b1c9A716f79A02E9DC5A5f5F98a'

describe('KeyPurchaseConfirmation', () => {
  describe('component', () => {
    it('calls signPurchaseData on submit', () => {
      expect.assertions(1)
      const signPurchaseData = jest.fn((_: PurchaseData) => true)
      const wrapper = rtl.render(
        <KeyPurchaseConfirmation
          address={address}
          emailAddress={emailAddress}
          signPurchaseData={signPurchaseData}
          lock={lock}
        />
      )
      const submitButton = wrapper.container.getElementsByTagName('button')[0]
      if (submitButton) {
        rtl.fireEvent.click(submitButton)
      }
      expect(signPurchaseData).toHaveBeenCalled()
    })

    it('is disabled when no lock can be found', () => {
      expect.assertions(2)
      const signPurchaseData = jest.fn((_: PurchaseData) => true)
      const { container, getByText } = rtl.render(
        <KeyPurchaseConfirmation
          address=""
          emailAddress=""
          signPurchaseData={signPurchaseData}
        />
      )

      expect(getByText('No lock found')).not.toBe(null)
      const submitButton = container.getElementsByTagName('button')[0]
      if (submitButton) {
        rtl.fireEvent.click(submitButton)
      }
      expect(signPurchaseData).not.toHaveBeenCalled()
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
    it('passes through the present values', () => {
      expect.assertions(1)
      const state = {
        account: {
          emailAddress,
          address,
        },
        cart: {
          lock,
        },
      }

      expect(mapStateToProps(state)).toEqual({
        emailAddress,
        address,
        lock,
      })
    })

    it('provides defaults when values are not available', () => {
      expect.assertions(1)
      const state = {
        account: {},
        cart: {},
      }
      expect(mapStateToProps(state)).toEqual({
        emailAddress: '',
        address: '',
      })
    })
  })
})
