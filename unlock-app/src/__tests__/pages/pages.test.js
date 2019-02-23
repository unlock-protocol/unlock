import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'

import { Home } from '../../pages/index'
import { Jobs } from '../../pages/jobs'
import { About } from '../../pages/about'
import { Dashboard } from '../../pages/dashboard'
import { pageTitle, ETHEREUM_NETWORKS_NAMES } from '../../constants'
import createUnlockStore from '../../createUnlockStore'

jest.mock('../../constants')

describe('Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Home', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      const config = {
        env: 'prod',
      }
      rtl.render(<Home config={config} />)
      expect(pageTitle).toBeCalled()
    })
  })

  describe('Jobs', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<Jobs />)
      expect(pageTitle).toBeCalledWith('Work at Unlock')
    })
  })

  describe('About', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<About />)
      expect(pageTitle).toBeCalledWith('About')
    })
  })

  describe('Dashboard', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      const network = {
        name: 4,
      }
      const currency = {
        USD: 195.99,
      }
      ETHEREUM_NETWORKS_NAMES[network.name] = ['A Name']
      const store = createUnlockStore({ currency, network })
      const account = {
        address: '0xabc',
        privateKey: 'deadbeef',
        balance: '200',
      }
      rtl.render(
        <Provider store={store}>
          <Dashboard
            account={account}
            network={network}
            transactions={{}}
            locks={{}}
          />
        </Provider>
      )
      expect(pageTitle).toBeCalledWith('Dashboard')
    })
  })
})
