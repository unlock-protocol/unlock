import React from 'react'
import * as rtl from '@testing-library/react'

import Home from '../../pages/index'
import DashboardContent from '../../components/content/DashboardContent'

import { pageTitle, ETHEREUM_NETWORKS_NAMES } from '../../constants'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'

const config = configure()

jest.mock('../../constants')

const network = {
  name: 4,
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

ETHEREUM_NETWORKS_NAMES[network.name] = 'A Name'

const ConfigProvider = ConfigContext.Provider

describe('Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dashboard', () => {
    it.skip('should render title correctly', () => {
      expect.assertions(1)

      rtl.render(
        <ConfigProvider value={config}>
          <DashboardContent
            account={account}
            network={network}
            transactions={{}}
            locks={{}}
            hideForm={() => {}}
            showForm={() => {}}
          />
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalledWith('Dashboard')
    })
  })

  describe('Home', () => {
    it.skip('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <ConfigProvider value={config}>
          <Home />
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalled()
    })
  })
})
