import React from 'react'
import * as rtl from '@testing-library/react'
import { Provider } from 'react-redux'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'

import {
  SettingsContent,
  mapStateToProps,
} from '../../../components/content/SettingsContent'

let useCardsMock: any

jest.mock('../../../hooks/useCards.ts', () => {
  return {
    useCards: jest.fn(() => useCardsMock),
  }
})

const config = {
  stripeApiKey: 'pk_not_a_real_key',
}

const store = createUnlockStore()

describe('SettingsContent', () => {
  beforeEach(() => {
    useCardsMock = { loading: false, cards: [] }
  })

  describe('Possible rendering states', () => {
    it('should prompt for login if there is no account', () => {
      expect.assertions(0)
      const { getByText } = rtl.render(
        <Provider store={store}>
          <ConfigContext.Provider value={config}>
            <SettingsContent account={undefined} />
          </ConfigContext.Provider>
        </Provider>
      )
      getByText('Log In to Your Account')
    })

    it('should only show crypto users the option to save a credit card', () => {
      expect.assertions(0)
      const { getByText } = rtl.render(
        <Provider store={store}>
          <ConfigContext.Provider value={config}>
            <SettingsContent account={{ address: '', balance: '' }} />
          </ConfigContext.Provider>
        </Provider>
      )
      getByText('Add a Payment Method')
    })
  })

  describe('mapStateToProps', () => {
    it('with default state it should return undefined account', () => {
      expect.assertions(1)

      expect(
        mapStateToProps({
          account: null,
        })
      ).toEqual({
        account: undefined,
      })
    })
  })
})
