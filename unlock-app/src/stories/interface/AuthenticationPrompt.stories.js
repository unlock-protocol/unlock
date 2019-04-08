import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'

import AuthenticationPrompt from '../../components/interface/AuthenticationPrompt'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('Authentication Prompt', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('The Prompt', () => {
    return <AuthenticationPrompt />
  })
