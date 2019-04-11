import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import Layout from '../../components/interface/Layout'
import { createUnlockStore } from '../../createUnlockStore'
import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'

const store = createUnlockStore({
  router: {
    location: {
      pathname: '/',
      search: '',
      hash: '',
    },
  },
})

const dashboardStore = createUnlockStore({
  router: {
    location: {
      pathname: '/dashboard',
      search: '',
      hash: '',
    },
  },
})

const config = configure()

storiesOf('Layout', module)
  .add('the layout for the dashboard', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <Provider store={dashboardStore}>
        <ConfigProvider value={config}>
          <Layout title="Unlock Dashboard" />
        </ConfigProvider>
      </Provider>
    )
  })
  .add('the layout for the content page', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <Provider store={store}>
        <ConfigProvider value={config}>
          <Layout forContent title="About Unlock" />
        </ConfigProvider>
      </Provider>
    )
  })
