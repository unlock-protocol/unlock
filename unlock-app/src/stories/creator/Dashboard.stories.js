import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import {
  DashboardContent,
  mapStateToProps,
} from '../../components/content/DashboardContent'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import WalletCheckOverlay from '../../components/interface/FullScreenModals'

const account = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
}
const network = {
  name: 1984,
}
const transactions = {
  '0x1234': {
    hash: '0x12345678',
    confirmations: 12,
    status: 'mined',
    lock: '0x12345678a',
    blockNumber: 1,
  },
  '0x5678': {
    hash: '0x56781234',
    confirmations: 4,
    status: 'mined',
    lock: '0x56781234a',
    blockNumber: 2,
  },
  '0x89ab': {
    hash: '0x9abcdef0',
    confirmations: 2,
    status: 'mined',
    lock: '0x9abcdef0a',
    blockNumber: 3,
  },
}
const locks = {
  '0x56781234a': {
    address: '0x56781234a',
    keyPrice: '0.01',
    expirationDuration: 86400,
    maxNumberOfKeys: 800,
    outstandingKeys: 32,
    transaction: '0x5678',
  },
  '0x12345678a': {
    address: '0x12345678a',
    name: 'My Blog',
    keyPrice: '0.027',
    expirationDuration: 172800,
    maxNumberOfKeys: 240,
    outstandingKeys: 3,
    transaction: '0x1234',
  },
  '0x9abcdef0a': {
    address: '0x9abcdef0',
    name: 'Infinite Lock',
    keyPrice: '0.027',
    expirationDuration: 172800,
    maxNumberOfKeys: 0,
    outstandingKeys: 10,
    transaction: '0x89ab',
  },
}

const router = {
  location: {
    pathname: '/dashboard',
    search: '',
    hash: '',
  },
}

const store = createUnlockStore({
  account,
  network,
  router,
  walletStatus: {
    waiting: false,
  },
})

const waitingStore = createUnlockStore({
  account,
  network,
  router,
  walletStatus: {
    waiting: true,
  },
})

const noUserStore = createUnlockStore({
  account: undefined,
  network,
  router,
})

const ConfigProvider = ConfigContext.Provider

const config = {
  providers: [],
  env: 'production',
  requiredConfirmations: 12,
}

const lockFormStatus = { visible: false }

storiesOf('DashboardContent', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .add('the dashboard', () => {
    // The overlay should not render here, because walletStatus:waiting is set
    // to false in the state
    const lockFeed = mapStateToProps({
      locks,
      transactions,
      account,
      network,
      lockFormStatus,
    }).lockFeed
    return (
      <Provider store={store}>
        <WalletCheckOverlay />
        <DashboardContent
          network={network}
          account={account}
          lockFeed={lockFeed}
          hideForm={() => {}}
          showForm={() => {}}
          formIsVisible={false}
        />
      </Provider>
    )
  })
  .add('the dashboard, waiting for wallet', () => {
    const lockFeed = mapStateToProps({
      locks,
      transactions,
      account,
      network,
      lockFormStatus,
    }).lockFeed
    return (
      <Provider store={waitingStore}>
        <WalletCheckOverlay />
        <DashboardContent
          network={network}
          account={account}
          lockFeed={lockFeed}
          hideForm={() => {}}
          showForm={() => {}}
          formIsVisible={false}
        />
      </Provider>
    )
  })
  .add('the dashboard, creating a lock', () => {
    // The overlay should not render here, because walletStatus:waiting is set
    // to false in the state
    const lockFeed = mapStateToProps({
      locks,
      transactions,
      account,
      network,
      lockFormStatus,
    }).lockFeed
    return (
      <Provider store={store}>
        <WalletCheckOverlay />
        <DashboardContent
          network={network}
          account={account}
          lockFeed={lockFeed}
          hideForm={() => {}}
          showForm={() => {}}
          formIsVisible
        />
      </Provider>
    )
  })
  .add('dashboard, no user account', () => {
    return (
      <Provider store={noUserStore}>
        <DashboardContent network={network} account={account} lockFeed={[]} />
      </Provider>
    )
  })
  .add('dashboard, no locks', () => {
    return (
      <Provider store={store}>
        <DashboardContent network={network} account={account} lockFeed={[]} />
      </Provider>
    )
  })
