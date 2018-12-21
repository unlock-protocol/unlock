import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import OverlayButtons from '../../components/interface/buttons/overlay'

import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('Buttons/Overlay Buttons', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Confirmed Key', () => {
    return <OverlayButtons.ConfirmedKey />
  })
