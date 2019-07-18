import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../../createUnlockStore'
import {
  AccountContent,
  mapStateToProps,
  mapDispatchToProps,
} from '../../../components/content/AccountContent'
import { DISMISS_PURCHASE_MODAL } from '../../../actions/keyPurchase'

const config = {
  stripeApiKey: 'pk_not_a_real_key',
}

const store = createUnlockStore({
  account: {
    emailAddress: 'john@smi.th',
  },
})

const mockCard: stripe.Card = {
  id: 'not_a_real_id',
  object: 'a string',
  brand: 'Visa',
  country: 'United States',
  dynamic_last4: '4242',
  exp_month: 12,
  exp_year: 2021,
  fingerprint: 'another string',
  funding: 'credit',
  last4: '4242',
  metadata: {},
}

describe('AccountContent', () => {
  describe('Possible rendering states', () => {
    it('Should prompt for login if there is no account', () => {
      expect.assertions(0)
      const { getByText } = rtl.render(
        <Provider store={store}>
          <AccountContent config={config} dismissPurchaseModal={() => true} />
        </Provider>
      )
      getByText((_, node) => {
        return !!node.textContent && !!node.textContent.match('Log In')
      })
    })

    it('Should collect payment details if there are no cards in account', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(
        <Provider store={store}>
          <AccountContent
            config={config}
            emailAddress="john@smi.th"
            cards={[]}
            dismissPurchaseModal={() => true}
          />
        </Provider>
      )

      getByText('Card Details')
    })

    it('Should prompt to confirm purchase if we have an account with cards', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(
        <Provider store={store}>
          <AccountContent
            config={config}
            emailAddress="john@smi.th"
            cards={[mockCard]}
            dismissPurchaseModal={() => true}
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
            config={config}
            emailAddress="john@smi.th"
            cards={[mockCard]}
            dismissPurchaseModal={dismissPurchaseModal}
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
    it('should return empty object if no account in state', () => {
      expect.assertions(2)
      expect(mapStateToProps({})).toEqual({})
      // or if state has an account with no contents
      expect(mapStateToProps({ account: {} })).toEqual({})
    })

    it('should grab and pass email and cards from account if available', () => {
      expect.assertions(1)
      const emailAddress = 'football@sports.gov'
      const cards: stripe.Card[] = []
      const state = {
        account: {
          emailAddress,
          cards,
        },
      }

      expect(mapStateToProps(state)).toEqual({
        emailAddress,
        cards,
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
