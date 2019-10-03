import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../../createUnlockStore'
import {
  AccountContent,
  mapStateToProps,
  mapDispatchToProps,
  getStripeHelper,
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
          <AccountContent
            config={config}
            dismissPurchaseModal={() => true}
            pageIsLocked={false}
          />
        </Provider>
      )
      getByText((_, node) => {
        return !!node.textContent && !!node.textContent.match('Log In')
      })
    })

    it('Should show the message about already having a key if the page is unlocked after logging in', () => {
      expect.assertions(0)

      const { getByText } = rtl.render(
        <Provider store={store}>
          <AccountContent
            config={config}
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
            config={config}
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
            config={config}
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
            config={config}
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
      const cards: stripe.Card[] = []
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

  describe('getStripeHelper', () => {
    it('should do nothing when window does not contain stripe', () => {
      expect.assertions(2)

      jest.useFakeTimers()
      const interval = setInterval(() => {}, 15000)
      const setStripe = jest.fn()

      getStripeHelper({}, interval, setStripe)

      expect(clearInterval).not.toHaveBeenCalled()
      expect(setStripe).not.toHaveBeenCalled()
    })

    it('should setStripe and clearInterval when the window does contain stripe', () => {
      expect.assertions(2)

      jest.useFakeTimers()
      const interval = setInterval(() => {}, 15000)
      const setStripe = jest.fn()
      const Stripe = jest.fn()
      ;(Stripe as any).version = 16000

      getStripeHelper(
        {
          Stripe: Stripe as any,
        },
        interval,
        setStripe
      )

      expect(clearInterval).toHaveBeenCalledWith(interval)
      expect(setStripe).toHaveBeenCalledWith(Stripe)
    })
  })
})
