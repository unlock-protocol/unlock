import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import WalletCheckOverlay from '../../components/interface/FullScreenModals'
import createUnlockStore from '../../createUnlockStore'

const waitingStore = createUnlockStore({
  walletStatus: {
    waiting: true,
  },
})

const notWaitingStore = createUnlockStore({
  walletStatus: {
    waiting: false,
  },
})

storiesOf('Wallet Check Overlay', module)
  .add('Waiting for wallet', () => {
    return (
      <Provider store={waitingStore}>
        <WalletCheckOverlay />
      </Provider>
    )
  })
  .add('Not waiting for wallet', () => {
    // This story should appear blank; if we're not waiting, the overlay doesn't
    // render
    return (
      <Provider store={notWaitingStore}>
        <WalletCheckOverlay />
      </Provider>
    )
  })
