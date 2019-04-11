import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'

import Home from '../../pages/home'
import Log from '../../pages/log'
import DashboardContent from '../../components/content/DashboardContent'

import { pageTitle, ETHEREUM_NETWORKS_NAMES } from '../../constants'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'

const config = configure()

jest.mock('../../constants')

const network = {
  name: 4,
}
const currency = {
  USD: 195.99,
}
const router = {
  location: {
    pathname: '/',
    search: '',
    hash: '',
  },
}
const account = {
  address: '0xabc',
  privateKey: 'deadbeef',
  balance: '200',
}

ETHEREUM_NETWORKS_NAMES[network.name] = ['A Name']
const store = createUnlockStore({ currency, network, router })
const ConfigProvider = ConfigContext.Provider

describe('Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dashboard', () => {
    it('should render title correctly', () => {
      expect.assertions(1)

      rtl.render(
        <ConfigProvider value={config}>
          <Provider store={store}>
            <DashboardContent
              account={account}
              network={network}
              transactions={{}}
              locks={{}}
              hideForm={() => {}}
              showForm={() => {}}
            />
          </Provider>
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalledWith('Dashboard')
    })
  })

  describe('Home', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <ConfigProvider value={config}>
          <Provider store={store}>
            <Home />
          </Provider>
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalled()
    })
  })

  describe('Log', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <ConfigProvider value={config}>
          <Provider store={store}>
            <Log account={account} />
          </Provider>
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalledWith('Log')
    })
  })
})
