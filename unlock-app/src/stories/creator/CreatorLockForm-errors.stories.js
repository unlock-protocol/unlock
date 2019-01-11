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

storiesOf('CreatorLockForm/invalid', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('missing name', () => {
    return (
      <CreatorLockForm
        name=""
        valid={false}
        hideAction={action('hide')}
        setError={action('setError')}
      />
    )
  })
  .add('invalid duration', () => {
    return (
      <CreatorLockForm
        expirationDuration={-1}
        valid={false}
        hideAction={action('hide')}
        setError={action('setError')}
      />
    )
  })
  .add('invalid num keys', () => {
    return (
      <CreatorLockForm
        maxNumberOfKeys={-1}
        valid={false}
        hideAction={action('hide')}
        setError={action('setError')}
      />
    )
  })
  .add('invalid key price', () => {
    return (
      <CreatorLockForm
        keyPrice="-1"
        valid={false}
        hideAction={action('hide')}
        setError={action('setError')}
      />
    )
  })
