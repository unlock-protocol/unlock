import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'

import { Home } from '../../pages/index'
import { Jobs } from '../../pages/jobs'
import { About } from '../../pages/about'
import { Dashboard } from '../../pages/dashboard'
import { pageTitle, ETHEREUM_NETWORKS_NAMES } from '../../constants'
import createUnlockStore from '../../createUnlockStore'
import BlogIndex from '../../components/content/BlogIndex'
import Blog from '../../pages/blog'
import Post from '../../pages/post'
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
ETHEREUM_NETWORKS_NAMES[network.name] = ['A Name']
const store = createUnlockStore({ currency, network, router })

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
      rtl.render(
        <Provider store={store}>
          <Home config={config} />
        </Provider>
      )
      expect(pageTitle).toBeCalled()
    })
  })

  describe('Jobs', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <Provider store={store}>
          <Jobs />
        </Provider>
      )
      expect(pageTitle).toBeCalledWith('Work at Unlock')
    })
  })

  describe('About', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <Provider store={store}>
          <About />
        </Provider>
      )
      expect(pageTitle).toBeCalledWith('About')
    })
  })

  describe('Dashboard', () => {
    it('should render title correctly', () => {
      expect.assertions(1)

      const account = {
        address: '0xabc',
        privateKey: 'deadbeef',
        balance: '200',
      }
      const ConfigProvider = ConfigContext.Provider
      rtl.render(
        <ConfigProvider value={config}>
          <Provider store={store}>
            <Dashboard
              account={account}
              network={network}
              transactions={{}}
              locks={{}}
            />
          </Provider>
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalledWith('Dashboard')
    })
  })

  describe('Blog', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<Blog posts={[]} />)
      expect(pageTitle).toBeCalledWith('Blog')
    })
  })

  describe('Post', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      let post = {
        title: 'Test post',
        slug: 'test1',
        description: 'Test description',
      }
      let slug = 'test1'
      rtl.render(<Post post={post} slug={slug} />)
      expect(pageTitle).toBeCalledWith(post.title)
    })
  })
})
