import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import CreateContent from '../../components/content/CreateContent'

import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('Create event landing page', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Create event page', () => {
    return <CreateContent />
  })
