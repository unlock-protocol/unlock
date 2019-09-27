import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'
import {
  SettingsContent,
  mapStateToProps,
} from '../../../components/content/SettingsContent'

const config = {
  stripeApiKey: 'pk_not_a_real_key',
}

const store = createUnlockStore()

/* const account = {
 *   emailAddress: 'john@smi.th',
 * }
 *
 * const mockCard: stripe.Card = {
 *   id: 'not_a_real_id',
 *   object: 'a string',
 *   brand: 'Visa',
 *   country: 'United States',
 *   dynamic_last4: '4242',
 *   exp_month: 12,
 *   exp_year: 2021,
 *   fingerprint: 'another string',
 *   funding: 'credit',
 *   last4: '4242',
 *   metadata: {},
 * } */

describe('SettingsContent', () => {
  describe('Possible rendering states', () => {
    it('should prompt for login if there is no account', () => {
      expect.assertions(0)
      const { getByText } = rtl.render(
        <Provider store={store}>
          <ConfigContext.Provider value={config}>
            <SettingsContent config={config} account={null} cards={[]} />
          </ConfigContext.Provider>
        </Provider>
      )
      getByText('Pay For Content Seamlessly')
    })

    it('should tell crypto users that they do not need the settings page', () => {
      expect.assertions(0)
      const { getByText } = rtl.render(
        <Provider store={store}>
          <ConfigContext.Provider value={config}>
            <SettingsContent config={config} account={{}} cards={[]} />
          </ConfigContext.Provider>
        </Provider>
      )
      getByText(
        "This page contains settings for managed account users. Crypto users (like you!) don't need it."
      )
    })
  })

  describe('mapStateToProps', () => {
    it('with default state it should return null account and empty cards list', () => {
      expect.assertions(1)

      expect(
        mapStateToProps({
          account: null,
        })
      ).toEqual({
        account: null,
        cards: [],
      })
    })
  })
})
