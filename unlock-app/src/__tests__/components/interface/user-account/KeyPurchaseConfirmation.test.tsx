import React from 'react'
import * as rtl from 'react-testing-library'
import { Key, Lock } from '../../../../unlockTypes'
import {
  KeyPurchaseConfirmation,
  mapDispatchToProps,
  mapStateToProps,
  makePriceBreakdown,
  displayCard,
} from '../../../../components/interface/user-account/KeyPurchaseConfirmation'
import { PurchaseData, SIGN_PURCHASE_DATA } from '../../../../actions/user'
import { Fees } from '../../../../actions/keyPurchase'

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
const fees: Fees = {
  creditCardProcessing: 450,
  gasFee: 30,
  keyPrice: 100,
  unlockServiceFee: 20,
}

const priceBreakdown = makePriceBreakdown(fees)

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
          card={displayCard(cards[0])}
          lock={lock}
          priceBreakdown={priceBreakdown}
        />
      )
      const submitButton = wrapper.container.getElementsByTagName('button')[0]
      if (submitButton) {
        rtl.fireEvent.click(submitButton)
      }
      expect(signPurchaseData).toHaveBeenCalledWith({
        recipient: address,
        lock: lock.address,
      })
    })

    it('transitions to a loading state after submitting', () => {
      expect.assertions(1)
      const signPurchaseData = jest.fn((_: PurchaseData) => true)
      const wrapper = rtl.render(
        <KeyPurchaseConfirmation
          address={address}
          emailAddress={emailAddress}
          signPurchaseData={signPurchaseData}
          card={displayCard(cards[0])}
          lock={lock}
          priceBreakdown={priceBreakdown}
        />
      )

      const loadingText = 'Submitting Transaction...'

      // We shouldn't already be in the submitted state
      expect(() => wrapper.getByText(loadingText)).toThrow()

      const submitButton = wrapper.container.getElementsByTagName('button')[0]
      if (submitButton) {
        rtl.fireEvent.click(submitButton)
      }

      // But now we should be
      wrapper.getByText(loadingText)
    })

    it('is disabled when no lock can be found', () => {
      expect.assertions(2)
      const signPurchaseData = jest.fn((_: PurchaseData) => true)
      const { container, getByText } = rtl.render(
        <KeyPurchaseConfirmation
          address=""
          emailAddress=""
          card={displayCard(cards[1])}
          signPurchaseData={signPurchaseData}
          priceBreakdown={priceBreakdown}
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
      expect.assertions(2)
      const dispatch = jest.fn()

      const dProps = mapDispatchToProps(dispatch)

      expect(dProps).toEqual(
        expect.objectContaining({
          signPurchaseData: expect.any(Function),
        })
      )

      dProps.signPurchaseData({
        recipient: '0x123',
        lock: '0xabc',
      })

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SIGN_PURCHASE_DATA,
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
          fees,
        },
      }

      expect(mapStateToProps(state)).toEqual({
        card: 'Visa ending in 4242',
        emailAddress,
        address,
        lock,
        priceBreakdown,
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
        card: '-',
        lock: undefined,
        priceBreakdown: {},
      })
    })
  })
})
