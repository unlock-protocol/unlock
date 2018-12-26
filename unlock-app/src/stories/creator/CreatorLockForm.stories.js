import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import CreatorLockForm from '../../components/creator/CreatorLockForm'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
  account: {
    address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
  },
})

storiesOf('CreatorLockForm', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Default', () => {
    return <CreatorLockForm hideAction={() => {}} />
  })
  .add('With existing lock', () => {
    // TODO: implement this
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      name: 'Existing Lock',
    }
    return <CreatorLockForm lock={lock} hideAction={() => {}} />
  })
