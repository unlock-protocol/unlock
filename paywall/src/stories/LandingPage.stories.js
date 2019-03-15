import React from 'react'
import { Provider } from 'react-redux'

import { storiesOf } from '@storybook/react'
import LandingPage from '../components/LandingPage'
import createUnlockStore from '../createUnlockStore'

const store = createUnlockStore()

storiesOf('Landing Page', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('The Landing Page', () => {
    return <LandingPage />
  })
