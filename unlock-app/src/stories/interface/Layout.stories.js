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

storiesOf('Layout', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('the layout for the dashboard', () => {
    return <Layout title="Unlock Dashboard" />
  })
  .add('the layout for the content page', () => {
    return <Layout forContent title="About Unlock" />
  })
