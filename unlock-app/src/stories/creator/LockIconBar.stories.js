import React from 'react'
import { storiesOf } from '@storybook/react'

import { Provider } from 'react-redux'
import LockIconBar from '../../components/creator/lock/LockIconBar'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('LockIconBar', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('LockIconBar', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }
    return <LockIconBar lock={lock} toggleCode={() => {}} />
  })
