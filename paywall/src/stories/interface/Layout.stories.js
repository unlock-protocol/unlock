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

storiesOf('Layout', module).add('the layout', () => {
  return (
    <Provider store={store}>
      <Layout title="Paywall" />
    </Provider>
  )
})
