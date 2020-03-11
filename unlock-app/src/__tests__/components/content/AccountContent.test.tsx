import React from 'react'
import * as rtl from '@testing-library/react'
import { Card } from '@stripe/stripe-js'
import { Provider } from 'react-redux'
import createUnlockStore from '../../../createUnlockStore'
import {
  AccountContent,
  mapStateToProps,
  mapDispatchToProps,
} from '../../../components/content/AccountContent'
import { DISMISS_PURCHASE_MODAL } from '../../../actions/keyPurchase'

const store = createUnlockStore({
  account: {
    emailAddress: 'john@smi.th',
  },
})

const mockCard: Card = {
  id: 'card_1Eox8QIsiZS2oQBMkU2KqFnq',
  brand: 'Visa',
  exp_month: 8,
  exp_year: 2020,
  last4: '4242',
  country: 'United States',
  dynamic_last4: '4242',
  fingerprint: '',
  funding: 'credit',
  metadata: {},
  address_city: null,
  address_country: 'USA',
  address_line1: null,
  address_line1_check: null,
  address_line2: null,
  address_zip: '90210',
  address_zip_check: null,
  address_state: null,
  object: 'card',
  cvc_check: null,
  name: 'Rupert Hendrickson',
  tokenization_method: null,
}

describe('AccountContent', () => {
  describe('Possible rendering states', () => {
    it('Should prompt for login if there is no account', () => {
      expect.assertions(0)
      const { getByText } = rtl.render(
        <Provider store={store}>
          <AccountContent
            dismissPurchaseModal={() => true}
            pageIsLocked={false}
          />
        </Provider>
      )
      getByText('Log In')
    })

    it('Should show the message about already having a key if the page is unlocked after logging in', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(
        <Provider store={store}>
          <AccountContent
            emailAddress="john@smi.th"
            cards={[]}
            dismissPurchaseModal={() => true}
            pageIsLocked={false}
          />
        </Provider>
      )

      getByText('You already own a key to this lock!')
    })

    it('Should collect payment details if there are no cards in account and the page is locked', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(
        <Provider store={store}>
          <AccountContent
            emailAddress="john@smi.th"
            cards={[]}
            dismissPurchaseModal={() => true}
            pageIsLocked
          />
        </Provider>
      )

      getByText('Card Details')
    })

    it('Should prompt to confirm purchase if we have an account with cards and the page is locked', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(
        <Provider store={store}>
          <AccountContent
            emailAddress="john@smi.th"
            cards={[mockCard]}
            dismissPurchaseModal={() => true}
            pageIsLocked
          />
        </Provider>
      )

      getByText('Confirm Purchase')
    })

    it('should dismiss the modal when close button is clicked', () => {
      expect.assertions(1)

      const dismissPurchaseModal = jest.fn()

      const { getByTitle } = rtl.render(
        <Provider store={store}>
          <AccountContent
            emailAddress="john@smi.th"
            cards={[mockCard]}
            dismissPurchaseModal={dismissPurchaseModal}
            pageIsLocked={false}
          />
        </Provider>
      )

      // No easy way to grab the button itself, need to select by SVG title
      const svg = getByTitle('Close')
      if (svg && svg.parentElement && svg.parentElement.parentElement) {
        const button = svg.parentElement.parentElement
        rtl.fireEvent.click(button)
        expect(dismissPurchaseModal).toHaveBeenCalled()
      }
    })
  })

  describe('mapStateToProps', () => {
    it('should return object without account if no account in state', () => {
      expect.assertions(2)
      expect(
        mapStateToProps({
          pageIsLocked: false,
        })
      ).toEqual({
        pageIsLocked: false,
      })
      // or if state has an account with no contents
      expect(
        mapStateToProps({
          account: {},
          pageIsLocked: false,
        })
      ).toEqual({
        pageIsLocked: false,
      })
    })

    it('should grab and pass email and cards from account if available', () => {
      expect.assertions(1)
      const emailAddress = 'football@sports.gov'
      const cards: Card[] = []
      const state = {
        account: {
          emailAddress,
          cards,
        },
        pageIsLocked: true,
      }

      expect(mapStateToProps(state)).toEqual({
        emailAddress,
        cards,
        pageIsLocked: true,
      })
    })
  })

  describe('mapDispatchToProps', () => {
    it('should be able to dispatch the dismiss purchase modal action', () => {
      expect.assertions(1)
      const dispatch = jest.fn()
      const { dismissPurchaseModal } = mapDispatchToProps(dispatch)
      dismissPurchaseModal()
      expect(dispatch).toHaveBeenCalledWith({
        type: DISMISS_PURCHASE_MODAL,
      })
    })
  })
})
