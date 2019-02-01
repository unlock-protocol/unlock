import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import Demo from '../../pages/staticdemo'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'

const myLock = {
  address: '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e',
  name: 'My Blog',
  keyPrice: '27000000000000000',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
}
const store = createUnlockStore({
  locks: {
    '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e': {
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      keyPrice: '10000000000000000000',
      expirationDuration: 86400,
      maxNumberOfKeys: 800,
      outstandingKeys: 32,
    },
    '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e': myLock,
  },
  router: {
    location: {
      pathname: '/demo/' + myLock.address,
      search: '',
      hash: '',
    },
  },
  currency: {
    USD: 195.99,
  },
})

const config = {
  env: 'dev',
  providers: { HTTP: {}, Metamask: {} },
}

storiesOf('Demo', module)
  .addDecorator(getStory => (
    <ConfigContext.Provider value={config}>
      <Provider store={store}>{getStory()}</Provider>
    </ConfigContext.Provider>
  ))
  .add('the demo', () => {
    return <Demo />
  })
