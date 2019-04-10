import { Provider } from 'react-redux'
import { action } from '@storybook/addon-actions'
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
    const lock = {}
    return (
      <CreatorLockForm
        saveLock={action('saveLock')}
        hideAction={action('hide')}
        setError={action('setError')}
        lock={lock}
      />
    )
  })
  .add('With existing lock', () => {
    // TODO: implement this
    const lock = {
      keyPrice: '0.01',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      name: 'Existing Lock',
    }
    return (
      <CreatorLockForm
        lock={lock}
        saveLock={action('saveLock')}
        hideAction={action('hide')}
        setError={action('setError')}
      />
    )
  })
