import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'

import Home from '../pages/home'
import createUnlockStore from '../createUnlockStore'
import { ConfigContext } from '../utils/withConfig'
import configure from '../config'

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

const ConfigProvider = ConfigContext.Provider

const config = configure({
  env: 'production',
})

storiesOf('Content pages', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('the Home page', () => {
    return (
      <ConfigProvider value={config}>
        <Home />
      </ConfigProvider>
    )
  })
