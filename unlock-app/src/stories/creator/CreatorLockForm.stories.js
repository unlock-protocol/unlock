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

storiesOf('CreatorLockForm', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
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
  .add('when using DAI', () => {
    const lock = {
      keyPrice: '0.01',
      currency: '0x123',
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
