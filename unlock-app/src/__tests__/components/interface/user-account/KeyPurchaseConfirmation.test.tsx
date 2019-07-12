import React from 'react'
import * as rtl from 'react-testing-library'
import { Key, Lock } from '../../../../unlockTypes'
import {
  KeyPurchaseConfirmation,
  mapDispatchToProps,
  mapStateToProps,
} from '../../../../components/interface/user-account/KeyPurchaseConfirmation'
import { PurchaseData } from '../../../../actions/user'

const cards: stripe.Card[] = [
  {
    id: 'card_1Eox8QIsiZS2oQBMkU2KqFnq',
    brand: 'Visa',
    exp_month: 8,
    exp_year: 2020,
    last4: '4242',
    country: 'United States',
    object: '',
    dynamic_last4: '4242',
    fingerprint: '',
    funding: 'credit',
    metadata: {},
  },
  {
    id: 'card_1EoxVMIsiZS2oQBMFzQ3ToR5',
    brand: 'American Express',
    exp_month: 12,
    exp_year: 2020,
    last4: '0005',
    country: 'United States',
    object: '',
    dynamic_last4: '0005',
    fingerprint: '',
    funding: 'credit',
    metadata: {},
  },
]

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
const price = 1212

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
          cards={cards}
          lock={lock}
          price={price}
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
          cards={cards}
          signPurchaseData={signPurchaseData}
          price={price}
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
          cards,
        },
        cart: {
          lock,
          price,
        },
      }

      expect(mapStateToProps(state)).toEqual({
        cards,
        emailAddress,
        address,
        lock,
        price,
      })
    })

    it('provides defaults when values are not available', () => {
      expect.assertions(1)
      const state = {
        account: {},
        cart: {
          price,
        },
      }
      expect(mapStateToProps(state)).toEqual({
        emailAddress: '',
        address: '',
        cards: [],
        lock: undefined,
        price: 1212,
      })
    })
  })
})
