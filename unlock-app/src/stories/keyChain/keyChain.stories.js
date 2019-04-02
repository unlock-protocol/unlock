import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import KeyChainContent from '../../components/content/KeyChainContent'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'

const account = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
}
const network = {
  name: 1984,
}

const router = {
  location: {
    pathname: '/keychain',
    search: '',
    hash: '',
  },
}

const store = createUnlockStore({
  router,
  network,
  account,
})

const noUserStore = createUnlockStore({
  account: undefined,
  network,
  router,
})

const ConfigProvider = ConfigContext.Provider

const config = configure({
  providers: [],
  env: 'production',
  requiredConfirmations: 12,
})

storiesOf('KeyChainContent', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .add('the key chain', () => {
    return (
      <Provider store={store}>
        <KeyChainContent />
      </Provider>
    )
  })
  .add('the key chain, no user account', () => {
    return (
      <Provider store={noUserStore}>
        <KeyChainContent />
      </Provider>
    )
  })
