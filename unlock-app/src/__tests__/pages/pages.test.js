import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'

import Home from '../../pages/home'
import Jobs from '../../pages/jobs'
import About from '../../pages/about'
import Log from '../../pages/log'
import Dashboard from '../../pages/dashboard'
import Privacy from '../../pages/privacy'
import Terms from '../../pages/terms'

import { pageTitle, ETHEREUM_NETWORKS_NAMES } from '../../constants'
import createUnlockStore from '../../createUnlockStore'
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

  describe('About', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <ConfigProvider value={config}>
          <Provider store={store}>
            <About />
          </Provider>
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalledWith('About')
    })
  })

  describe('Dashboard', () => {
    it('should render title correctly', () => {
      expect.assertions(1)

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

  describe('Jobs', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <ConfigProvider value={config}>
          <Provider store={store}>
            <Jobs />
          </Provider>
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalledWith('Work at Unlock')
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

  describe('Privacy', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <ConfigProvider value={config}>
          <Provider store={store}>
            <Privacy account={account} />
          </Provider>
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalledWith('Privacy Policy')
    })
  })

  describe('Terms', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <ConfigProvider value={config}>
          <Provider store={store}>
            <Terms account={account} />
          </Provider>
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalledWith('Terms of Service')
    })
  })

  describe('Blog', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <Provider store={store}>
          <Blog posts={[]} />
        </Provider>
      )

      expect(pageTitle).toBeCalledWith('Blog')
    })
    it('should render post preview correctly', () => {
      expect.assertions(3)

      const posts = [
        {
          slug: 'test1',
          title: 'Test post',
          publishDate: 'November 23, 1963',
          authorName: 'Susan Foreman',
          description: 'One day, I will come back.',
        },
      ]

      const page = rtl.render(
        <Provider store={store}>
          <Blog posts={posts} />
        </Provider>
      )

      expect(page.queryByText(posts[0].title)).not.toBeNull()
      expect(page.queryByText(posts[0].authorName)).not.toBeNull()
      expect(page.queryByText(posts[0].description)).not.toBeNull()
    })
  })

  describe('Post', () => {
    it('should render title correctly', () => {
      expect.assertions(3)
      const post = {
        title: 'Test post',
        slug: 'test1',
        description: 'Test description',
        publishDate: 'November 23, 1963',
        __content: 'Now is the limiter of this content',
      }
      const slug = 'test1'
      const page = rtl.render(
        <Provider store={store}>
          <Post post={post} slug={slug} />
        </Provider>
      )

      expect(pageTitle).toBeCalledWith(post.title)
      expect(page.queryByText(post.publishDate)).not.toBeNull()
      expect(page.queryByText(post.__content)).not.toBeNull()
    })
  })
})
