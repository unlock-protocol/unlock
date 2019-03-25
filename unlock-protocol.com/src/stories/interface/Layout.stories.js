import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import Layout from '../../components/interface/Layout'
import { createUnlockStore } from '../../createUnlockStore'

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

storiesOf('Layout', module)
  .add('the layout for the dashboard', () => {
    return (
      <Provider store={dashboardStore}>
        <Layout title="Unlock Dashboard" />
      </Provider>
    )
  })
  .add('the layout for the content page', () => {
    return (
      <Provider store={store}>
        <Layout forContent title="About Unlock" />
      </Provider>
    )
  })
