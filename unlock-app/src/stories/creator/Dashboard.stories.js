import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'

import { DashboardContent } from '../../components/content/DashboardContent'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import FullScreenModal from '../../components/interface/FullScreenModals'
import configure from '../../config'
import doNothing from '../../utils/doNothing'
import { KindOfModal } from '../../unlockTypes'

const account = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
  balance: '5',
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
    owner: account.address,
  },
  '0x12345678a': {
    address: '0x12345678a',
    name: 'My Blog',
    keyPrice: '0.027',
    expirationDuration: 172800,
    maxNumberOfKeys: 240,
    outstandingKeys: 3,
    transaction: '0x1234',
    owner: account.address,
  },
  '0x9abcdef0a': {
    address: '0x9abcdef0',
    name: 'Infinite Lock',
    keyPrice: '0.027',
    expirationDuration: 172800,
    maxNumberOfKeys: 0,
    outstandingKeys: 10,
    transaction: '0x89ab',
    owner: account.address,
  },
}

const router = {
  location: {
    pathname: '/dashboard',
    search: '',
    hash: '',
  },
}

const currency = {
  USD: 195.99,
}

const lockFormStatus = {
  visible: false,
}

const waitingStore = createUnlockStore({
  account,
  network,
  router,
  locks,
  transactions,
  currency,
  fullScreenModalStatus: {
    active: true,
    kindOfModal: KindOfModal.WalletCheckOverlay,
  },
  lockFormStatus,
})

const noUserStore = createUnlockStore({
  account: undefined,
  network,
  router,
  lockFormStatus,
})

const ConfigProvider = ConfigContext.Provider

const config = configure({
  providers: [],
  env: 'production',
  requiredConfirmations: 12,
})
storiesOf('DashboardContent', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .add('the dashboard, waiting for wallet', () => {
    return (
      <Provider store={waitingStore}>
        <FullScreenModal />
        <DashboardContent
          hideForm={doNothing}
          showForm={doNothing}
          network={network}
          account={null}
          formIsVisible={false}
        />
      </Provider>
    )
  })
  .add('dashboard, no user account', () => {
    return (
      <Provider store={noUserStore}>
        <DashboardContent
          hideForm={doNothing}
          showForm={doNothing}
          network={network}
          account={null}
          formIsVisible={false}
        />
      </Provider>
    )
  })
