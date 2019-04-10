import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import HomeContent from '../../components/content/HomeContent'

import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('Home landing page', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Home page', () => {
    return <HomeContent path="/" />
  })
