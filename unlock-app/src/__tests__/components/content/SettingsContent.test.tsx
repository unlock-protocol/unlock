import React from 'react'
import * as rtl from '@testing-library/react'
import { ConfigContext } from '../../../utils/withConfig'

import SettingsContent from '../../../components/content/SettingsContent'

let useCardsMock: any

jest.doMock('../../../hooks/useCards.ts', () => {
  return {
    useCards: jest.fn(() => useCardsMock),
  }
})

let useProviderMock: any

jest.doMock('../../../hooks/useProvider.ts', () => {
  return {
    useProvider: jest.fn(() => useProviderMock),
  }
})

const config = {
  stripeApiKey: 'pk_not_a_real_key',
  requiredNetworkId: 1337,
}
describe('SettingsContent', () => {
  beforeEach(() => {
    useCardsMock = { loading: false, cards: [] }
    useProviderMock = { loading: false, provider: {} }
  })

  describe('Possible rendering states', () => {
    it.skip('should prompt for login if there is no account', () => {
      expect.assertions(0)
      useProviderMock = { loading: false, provider: null }
      const { getByText } = rtl.render(
        <ConfigContext.Provider value={config}>
          <SettingsContent />
        </ConfigContext.Provider>
      )
      getByText('Log In')
    })

    it.skip('should only show crypto users the option to save a credit card', () => {
      expect.assertions(0)
      const { getByText } = rtl.render(
        <ConfigContext.Provider value={config}>
          <SettingsContent />
        </ConfigContext.Provider>
      )
      getByText('Add a Payment Method')
    })
  })
})
