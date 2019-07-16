import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../../createUnlockStore'
import {
  AccountContent,
  mapStateToProps,
} from '../../../components/content/AccountContent'

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
          <AccountContent config={config} />
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
          />
        </Provider>
      )

      getByText('Confirm Purchase')
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
})
