import React from 'react'
import * as rtl from '@testing-library/react'
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

describe('SettingsContent', () => {
  describe('Possible rendering states', () => {
    it('should prompt for login if there is no account', () => {
      expect.assertions(0)
      const { getByText } = rtl.render(
        <Provider store={store}>
          <ConfigContext.Provider value={config}>
            <SettingsContent account={null} cards={[]} />
          </ConfigContext.Provider>
        </Provider>
      )
      getByText('Log In to Your Account')
    })

    it('should tell crypto users that they do not need the settings page', () => {
      expect.assertions(0)
      const { getByText } = rtl.render(
        <Provider store={store}>
          <ConfigContext.Provider value={config}>
            <SettingsContent account={{}} cards={[]} />
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
