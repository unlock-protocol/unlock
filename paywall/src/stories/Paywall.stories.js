import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import Paywall from '../components/Paywall'
import createUnlockStore from '../createUnlockStore'
import { ConfigContext } from '../utils/withConfig'
import { WindowContext } from '../hooks/browser/useWindow'
import FakeIframe from '../utils/FakeIframe'

const lock = {
  address: '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e',
  name: 'My Blog',
  keyPrice: '0.027',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
  currencyContractAddress: null,
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
      currencyContractAddress: null,
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
const unlockedTransactions = {
  '0x06094207a34b7f1c19b93d337d0c91c357d45ff8e584deb003e67b637db3d876': {
    hash: '0x06094207a34b7f1c19b93d337d0c91c357d45ff8e584deb003e67b637db3d876',
    type: 'KEY_PURCHASE',
    lock: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    status: 'mined',
    confirmations: 200,
    key: '0xab7c74abc0c4d48d1bdad5dcb26153fc87eeeeee',
    to: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    from: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
  },
}
const unlockedState = {
  ...lockedState,
  keys: {
    '0xab7c74abc0c4d48d1bdad5dcb26153fc87eeeeee-0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2': {
      id:
        '0xab7c74abc0c4d48d1bdad5dcb26153fc87eeeeee-0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
      lock: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
      expiration: new Date('December 31, 3000 12:00:00').getTime() / 1000,
      transaction:
        '0x06094207a34b7f1c19b93d337d0c91c357d45ff8e584deb003e67b637db3d876',
      transactions: unlockedTransactions,
    },
  },
  transactions: unlockedTransactions,
  router: {
    location: {
      pathname: '/demo/0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      search: '',
      hash: '',
    },
  },
}
const lockedStore = createUnlockStore(lockedState)
const unlockedStore = createUnlockStore(unlockedState)

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

const fakeWindow = {
  fetch: () => ({
    // dummy to prevent errors on CI
    // this is the expected shape of returns from locksmith for optimism
    json: Promise.resolve({ willSucceed: 0 }),
  }),
  document: { body: { style: {} } },
  location: { pathname: '/0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e' },
}

storiesOf('Paywall', module)
  // pass in a fake window object, to avoid modifying the real body and munging storyshots
  .addDecorator(getStory => (
    <ConfigContext.Provider value={config}>
      <WindowContext.Provider value={fakeWindow}>
        <FakeIframe hide>{getStory()}</FakeIframe>
      </WindowContext.Provider>
    </ConfigContext.Provider>
  ))
  .add('the paywall overlay', () => {
    return (
      <Provider store={lockedStore}>
        <Paywall />
      </Provider>
    )
  })
  .add('the paywall overlay, unlocked', () => {
    return (
      <Provider store={unlockedStore}>
        <Paywall />
      </Provider>
    )
  })
