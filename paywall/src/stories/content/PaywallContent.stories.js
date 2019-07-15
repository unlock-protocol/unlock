import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import PaywallContent from '../../components/content/PaywallContent'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import { WindowContext } from '../../hooks/browser/useWindow'

const lock = {
  address: '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e',
  name: 'My Blog',
  keyPrice: '0.027',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
}
const lockedState = {
  account: {
    address: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
    balance: '989898989898',
  },
  locks: {
    '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e': {
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      keyPrice: '0.01',
      expirationDuration: 86400,
      maxNumberOfKeys: 800,
      outstandingKeys: 32,
    },
    '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e': lock,
  },
  router: {
    location: {
      pathname: '/demo/' + lock.address,
      search: '',
      hash: '',
    },
  },
  currency: {
    USD: 195.99,
  },
}
const lockedStore = createUnlockStore(lockedState)

const config = {
  env: 'dev',
  providers: {
    HTTP: [],
  },
  requiredConfirmations: 12,
  erc20Contract: {
    address: 'blah',
  },
}

storiesOf('Paywall app page', module)
  // pass in a fake window object, to avoid modifying the real body and munging storyshots
  .addDecorator(getStory => (
    <ConfigContext.Provider value={config}>
      <WindowContext.Provider
        value={{
          document: { body: { style: {} } },
          location: { pathname: '/0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e' },
        }}
      >
        {getStory()}
      </WindowContext.Provider>
    </ConfigContext.Provider>
  ))
  .add('Paywall', () => {
    return (
      <Provider store={lockedStore}>
        <PaywallContent path="/0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e" />
      </Provider>
    )
  })
