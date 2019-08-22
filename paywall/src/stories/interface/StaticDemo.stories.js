import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import StaticDemo from '../../components/interface/StaticDemo'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import { WindowContext } from '../../hooks/browser/useWindow'

const myLock = {
  address: '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e',
  name: 'My Blog',
  keyPrice: '0.027',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
}
const store = createUnlockStore({
  account: {
    address: '0x123',
    balance: '5.4',
  },
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
      pathname: '/newdemo?lock=' + myLock.address,
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
  requiredConfirmations: 12,
}

const fakeWindow = {
  fetch: () => ({
    // dummy to prevent errors on CI
    // this is the expected shape of returns from locksmith for optimism
    json: Promise.resolve({ willSucceed: 0 }),
  }),
  document: { body: { style: {} } },
  location: { pathname: '/0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e' },
}

storiesOf('StaticDemo', module)
  .addDecorator(getStory => (
    <ConfigContext.Provider value={config}>
      <WindowContext.Provider value={fakeWindow}>
        <Provider store={store}>{getStory()}</Provider>
      </WindowContext.Provider>
    </ConfigContext.Provider>
  ))
  .add('the demo', () => {
    return <StaticDemo />
  })
