import { Provider } from 'react-redux'
import { action } from '@storybook/addon-actions'
import React from 'react'
import { storiesOf } from '@storybook/react'
import CreatorLockForm from '../../components/creator/CreatorLockForm'
import createUnlockStore from '../../createUnlockStore'
import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'

const config = configure()

const ConfigProvider = ConfigContext.Provider

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
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .add('missing name', () => {
    const lock = {
      name: '',
      valid: false,
    }
    return (
      <CreatorLockForm
        lock={lock}
        hideAction={action('hide')}
        setError={action('setError')}
        saveLock={action('saveLock')}
      />
    )
  })
  .add('invalid duration', () => {
    const lock = {
      expirationDuration: -1 * 86400,
      valid: false,
    }
    return (
      <CreatorLockForm
        lock={lock}
        hideAction={action('hide')}
        setError={action('setError')}
        saveLock={action('saveLock')}
      />
    )
  })
  .add('invalid num keys', () => {
    const lock = {
      maxNumberOfKeys: -2,
      valid: false,
    }
    return (
      <CreatorLockForm
        lock={lock}
        hideAction={action('hide')}
        setError={action('setError')}
        saveLock={action('saveLock')}
      />
    )
  })
  .add('invalid key price', () => {
    const lock = {
      keyPrice: '-1',
      valid: false,
    }
    return (
      <CreatorLockForm
        lock={lock}
        hideAction={action('hide')}
        setError={action('setError')}
        saveLock={action('saveLock')}
      />
    )
  })
