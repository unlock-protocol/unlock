import { Provider } from 'react-redux'
import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { storiesOf } from '@storybook/react'
import Paywall from '../components/Paywall'
import createUnlockStore from '../createUnlockStore'
import { ConfigContext } from '../utils/withConfig'
import { WindowContext } from '../hooks/browser/useWindow'

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
const unlockedState = {
  ...lockedState,
  keys: {
    '0xab7c74abc0c4d48d1bdad5dcb26153fc87eeeeee': {
      lock: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
      expiration: new Date('December 31, 3000 12:00:00').getTime() / 1000,
      transaction:
        '0x06094207a34b7f1c19b93d337d0c91c357d45ff8e584deb003e67b637db3d876',
    },
  },
  transactions: {
    '0x06094207a34b7f1c19b93d337d0c91c357d45ff8e584deb003e67b637db3d876': {
      hash:
        '0x06094207a34b7f1c19b93d337d0c91c357d45ff8e584deb003e67b637db3d876',
      type: 'LOCK_CREATION',
      lock: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      status: 'mined',
      confirmations: 200,
    },
  },
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
}

function FakeItTillYouMakeIt({ children }) {
  const divit = useRef()
  return (
    <div
      ref={divit}
      style={{
        position: 'absolute',
        right: 0,
        bottom: '105px',
        width: '134px',
        height: '160px',
        marginRight: '-104px',
        transition: 'margin-right 0.4s ease-in',
      }}
      onMouseEnter={() => (divit.current.style.marginRight = 0)}
      onMouseLeave={() => (divit.current.style.marginRight = '-104px')}
    >
      {children}
    </div>
  )
}

FakeItTillYouMakeIt.propTypes = {
  children: PropTypes.node.isRequired,
}

storiesOf('Paywall', module)
  // pass in a fake window object, to avoid modifying the real body and munging storyshots
  .addDecorator(getStory => (
    <ConfigContext.Provider value={config}>
      <WindowContext.Provider
        value={{
          document: { body: { style: {} } },
          location: { pathname: '/0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e' },
        }}
      >
        <FakeItTillYouMakeIt>{getStory()}</FakeItTillYouMakeIt>
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
