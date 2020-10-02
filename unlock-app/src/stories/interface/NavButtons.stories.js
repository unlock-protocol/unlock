import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import NavButtons from '../../components/interface/buttons/navigation'

import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('Buttons/Nav Buttons', module)
  .addDecorator((getStory) => <Provider store={store}>{getStory()}</Provider>)
  .add('Dashboard', () => {
    return <NavButtons.Dashboard activePath="/" />
  })
  .add('Dashboard, active', () => {
    return <NavButtons.Dashboard activePath="/dashboard" />
  })
