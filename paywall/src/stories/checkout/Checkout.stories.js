import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Checkout from '../../components/checkout/Checkout'
import CheckoutWrapper from '../../components/checkout/CheckoutWrapper'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'

const purchaseKey = () => {}
const hideCheckout = () => {}

const ConfigProvider = ConfigContext.Provider

const config = configure()

const paywallConfig = {
  icon:
    'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNTQiPg0KICA8cGF0aCBkPSJNMTEzLjMgMTguMmMwLTUuOC4xLTExLjIuNC0xNi4yTDk4LjQgNC45djEuNGwxLjUuMmMxLjEuMSAxLjguNSAyLjIgMS4xLjQuNy43IDEuNy45IDMuMi4yIDIuOS40IDkuNS4zIDE5LjkgMCAxMC4zLS4xIDE2LjgtLjMgMTkuMyA1LjUgMS4yIDkuOCAxLjcgMTMgMS43IDYgMCAxMC43LTEuNyAxNC4xLTUuMiAzLjQtMy40IDUuMi04LjIgNS4yLTE0LjEgMC00LjctMS4zLTguNi0zLjktMTEuNy0yLjYtMy4xLTUuOS00LjYtOS44LTQuNi0yLjYgMC01LjMuNy04LjMgMi4xem0uMyAzMC44Yy0uMi0zLjItLjQtMTIuOC0uNC0yOC41LjktLjMgMi4xLS41IDMuNi0uNSAyLjQgMCA0LjMgMS4yIDUuNyAzLjcgMS40IDIuNSAyLjEgNS41IDIuMSA5LjMgMCA0LjctLjggOC41LTIuNCAxMS43LTEuNiAzLjEtMy42IDQuNy02LjEgNC43LS44LS4yLTEuNi0uMy0yLjUtLjR6TTQxIDNIMXYybDIuMS4yYzEuNi4zIDIuNy45IDMuNCAxLjguNyAxIDEuMSAyLjYgMS4yIDQuOC44IDEwLjguOCAyMC45IDAgMzAuMi0uMiAyLjItLjYgMy44LTEuMiA0LjgtLjcgMS0xLjggMS42LTMuNCAxLjhsLTIuMS4zdjJoMjUuOHYtMmwtMi43LS4yYy0xLjYtLjItMi43LS45LTMuNC0xLjgtLjctMS0xLjEtMi42LTEuMi00LjgtLjMtNC0uNS04LjYtLjUtMTMuN2w1LjQuMWMyLjkuMSA0LjkgMi4zIDUuOSA2LjdoMlYxOC45aC0yYy0xIDQuMy0yLjkgNi41LTUuOSA2LjZsLTUuNC4xYzAtOSAuMi0xNS40LjUtMTkuM2g3LjljNS42IDAgOS40IDMuNiAxMS42IDEwLjhsMi40LS43TDQxIDN6bS00LjcgMzAuOGMwIDUuMiAxLjUgOS41IDQuNCAxMi45IDIuOSAzLjQgNy4yIDUgMTIuNiA1czkuOC0xLjcgMTMtNS4yYzMuMi0zLjQgNC43LTcuNyA0LjctMTIuOXMtMS41LTkuNS00LjQtMTIuOWMtMi45LTMuNC03LjItNS0xMi42LTVzLTkuOCAxLjctMTMgNS4yYy0zLjIgMy40LTQuNyA3LjctNC43IDEyLjl6bTIyLjMtMTEuNGMxLjIgMi45IDEuNyA2LjcgMS43IDExLjMgMCAxMC42LTIuMiAxNS44LTYuNSAxNS44LTIuMiAwLTMuOS0xLjUtNS4xLTQuNS0xLjItMy0xLjctNi44LTEuNy0xMS4zQzQ3IDIzLjIgNDkuMiAxOCA1My41IDE4YzIuMi0uMSAzLjkgMS40IDUuMSA0LjR6bTg0LjUgMjQuM2MzLjMgMy4zIDcuNSA1IDEyLjUgNSAzLjEgMCA1LjgtLjYgOC4yLTEuOSAyLjQtMS4yIDQuMy0yLjcgNS42LTQuNWwtMS0xLjJjLTIuMiAxLjctNC43IDIuNS03LjYgMi41LTQgMC03LjEtMS4zLTkuMi00LTIuMi0yLjctMy4yLTYuMS0zLTEwLjVIMTcwYzAtNC44LTEuMi04LjctMy43LTExLjgtMi41LTMtNi00LjUtMTAuNS00LjUtNS42IDAtOS45IDEuOC0xMyA1LjMtMy4xIDMuNS00LjYgNy44LTQuNiAxMi45IDAgNS4yIDEuNiA5LjQgNC45IDEyLjd6bTcuNC0yNS4xYzEuMS0yLjQgMi41LTMuNiA0LjQtMy42IDMgMCA0LjUgMy44IDQuNSAxMS41bC0xMC42LjJjLjEtMyAuNi01LjcgMS43LTguMXptNDYuNC00Yy0yLjctMS4yLTYuMS0xLjktMTAuMi0xLjktNC4yIDAtNy41IDEuMS0xMCAzLjJzLTMuOCA0LjctMy44IDcuOGMwIDIuNy44IDQuOCAyLjMgNi4zIDEuNSAxLjUgMy45IDIuOCA3IDMuOSAyLjggMSA0LjggMiA1LjggMi45IDEgMSAxLjYgMi4xIDEuNiAzLjYgMCAxLjQtLjUgMi43LTEuNiAzLjctMSAxLjEtMi40IDEuNi00LjIgMS42LTQuNCAwLTcuNy0zLjItMTAtOS42bC0xLjcuNS40IDEwYzMuNiAxLjQgNy42IDIuMSAxMiAyLjEgNC42IDAgOC4xLTEgMTAuNy0zLjEgMi42LTIgMy45LTQuOSAzLjktOC41IDAtMi40LS42LTQuNC0xLjktNS45LTEuMy0xLjUtMy40LTIuOC02LjQtNC0zLjMtMS4yLTUuNi0yLjMtNi44LTMuMy0xLjItMS0xLjgtMi4yLTEuOC0zLjdzLjQtMi43IDEuMy0zLjcgMi0xLjQgMy40LTEuNGM0IDAgNi45IDIuOSA4LjcgOC42bDEuNy0uNS0uNC04LjZ6bS05Ni4yLS45Yy0xLjQtLjctMi45LTEtNC42LTEtMS43IDAtMy40LjctNS4zIDIuMS0xLjkgMS40LTMuMyAzLjMtNC40IDUuOWwuMS04LTE1LjIgM3YxLjRsMS41LjFjMS45LjIgMyAxLjcgMy4yIDQuNC42IDYuMi42IDEyLjggMCAxOS44LS4yIDIuNy0xLjMgNC4xLTMuMiA0LjRsLTEuNS4ydjEuOWgyMS4yVjQ5bC0yLjctLjJjLTEuOS0uMi0zLTEuNy0zLjItNC40LS42LTUuOC0uNy0xMi0uMi0xOC40LjYtMSAxLjktMS42IDMuOS0xLjggMi0uMiA0LjMuNCA2LjcgMS44bDMuNy05LjN6Ij48L3BhdGg+DQo8L3N2Zz4=',
  callToAction: {
    default:
      'Enjoy Forbes Online without any ads for as little as $2 a week. \nPay with Ethereum in just two clicks.',
    confirmed:
      'Thanks a lot for your business! Please tell your friends about us.',
    pending:
      'Thanks a lot for your business. Your transaction is being processed. You should get your NFT as soon as it is confirmed, but you can access the content right now!',
    expired: 'Your membership has now expired. Please purchase a new key now.',
  },
  locks: {
    '0x123': {
      name: 'One Week',
    },
    '0x456': {
      name: 'One Month',
    },
    '0x789': {
      name: 'One Year at a discount of 20%',
    },
  },
}

const paywallConfigNoNames = {
  icon:
    'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNTQiPg0KICA8cGF0aCBkPSJNMTEzLjMgMTguMmMwLTUuOC4xLTExLjIuNC0xNi4yTDk4LjQgNC45djEuNGwxLjUuMmMxLjEuMSAxLjguNSAyLjIgMS4xLjQuNy43IDEuNy45IDMuMi4yIDIuOS40IDkuNS4zIDE5LjkgMCAxMC4zLS4xIDE2LjgtLjMgMTkuMyA1LjUgMS4yIDkuOCAxLjcgMTMgMS43IDYgMCAxMC43LTEuNyAxNC4xLTUuMiAzLjQtMy40IDUuMi04LjIgNS4yLTE0LjEgMC00LjctMS4zLTguNi0zLjktMTEuNy0yLjYtMy4xLTUuOS00LjYtOS44LTQuNi0yLjYgMC01LjMuNy04LjMgMi4xem0uMyAzMC44Yy0uMi0zLjItLjQtMTIuOC0uNC0yOC41LjktLjMgMi4xLS41IDMuNi0uNSAyLjQgMCA0LjMgMS4yIDUuNyAzLjcgMS40IDIuNSAyLjEgNS41IDIuMSA5LjMgMCA0LjctLjggOC41LTIuNCAxMS43LTEuNiAzLjEtMy42IDQuNy02LjEgNC43LS44LS4yLTEuNi0uMy0yLjUtLjR6TTQxIDNIMXYybDIuMS4yYzEuNi4zIDIuNy45IDMuNCAxLjguNyAxIDEuMSAyLjYgMS4yIDQuOC44IDEwLjguOCAyMC45IDAgMzAuMi0uMiAyLjItLjYgMy44LTEuMiA0LjgtLjcgMS0xLjggMS42LTMuNCAxLjhsLTIuMS4zdjJoMjUuOHYtMmwtMi43LS4yYy0xLjYtLjItMi43LS45LTMuNC0xLjgtLjctMS0xLjEtMi42LTEuMi00LjgtLjMtNC0uNS04LjYtLjUtMTMuN2w1LjQuMWMyLjkuMSA0LjkgMi4zIDUuOSA2LjdoMlYxOC45aC0yYy0xIDQuMy0yLjkgNi41LTUuOSA2LjZsLTUuNC4xYzAtOSAuMi0xNS40LjUtMTkuM2g3LjljNS42IDAgOS40IDMuNiAxMS42IDEwLjhsMi40LS43TDQxIDN6bS00LjcgMzAuOGMwIDUuMiAxLjUgOS41IDQuNCAxMi45IDIuOSAzLjQgNy4yIDUgMTIuNiA1czkuOC0xLjcgMTMtNS4yYzMuMi0zLjQgNC43LTcuNyA0LjctMTIuOXMtMS41LTkuNS00LjQtMTIuOWMtMi45LTMuNC03LjItNS0xMi42LTVzLTkuOCAxLjctMTMgNS4yYy0zLjIgMy40LTQuNyA3LjctNC43IDEyLjl6bTIyLjMtMTEuNGMxLjIgMi45IDEuNyA2LjcgMS43IDExLjMgMCAxMC42LTIuMiAxNS44LTYuNSAxNS44LTIuMiAwLTMuOS0xLjUtNS4xLTQuNS0xLjItMy0xLjctNi44LTEuNy0xMS4zQzQ3IDIzLjIgNDkuMiAxOCA1My41IDE4YzIuMi0uMSAzLjkgMS40IDUuMSA0LjR6bTg0LjUgMjQuM2MzLjMgMy4zIDcuNSA1IDEyLjUgNSAzLjEgMCA1LjgtLjYgOC4yLTEuOSAyLjQtMS4yIDQuMy0yLjcgNS42LTQuNWwtMS0xLjJjLTIuMiAxLjctNC43IDIuNS03LjYgMi41LTQgMC03LjEtMS4zLTkuMi00LTIuMi0yLjctMy4yLTYuMS0zLTEwLjVIMTcwYzAtNC44LTEuMi04LjctMy43LTExLjgtMi41LTMtNi00LjUtMTAuNS00LjUtNS42IDAtOS45IDEuOC0xMyA1LjMtMy4xIDMuNS00LjYgNy44LTQuNiAxMi45IDAgNS4yIDEuNiA5LjQgNC45IDEyLjd6bTcuNC0yNS4xYzEuMS0yLjQgMi41LTMuNiA0LjQtMy42IDMgMCA0LjUgMy44IDQuNSAxMS41bC0xMC42LjJjLjEtMyAuNi01LjcgMS43LTguMXptNDYuNC00Yy0yLjctMS4yLTYuMS0xLjktMTAuMi0xLjktNC4yIDAtNy41IDEuMS0xMCAzLjJzLTMuOCA0LjctMy44IDcuOGMwIDIuNy44IDQuOCAyLjMgNi4zIDEuNSAxLjUgMy45IDIuOCA3IDMuOSAyLjggMSA0LjggMiA1LjggMi45IDEgMSAxLjYgMi4xIDEuNiAzLjYgMCAxLjQtLjUgMi43LTEuNiAzLjctMSAxLjEtMi40IDEuNi00LjIgMS42LTQuNCAwLTcuNy0zLjItMTAtOS42bC0xLjcuNS40IDEwYzMuNiAxLjQgNy42IDIuMSAxMiAyLjEgNC42IDAgOC4xLTEgMTAuNy0zLjEgMi42LTIgMy45LTQuOSAzLjktOC41IDAtMi40LS42LTQuNC0xLjktNS45LTEuMy0xLjUtMy40LTIuOC02LjQtNC0zLjMtMS4yLTUuNi0yLjMtNi44LTMuMy0xLjItMS0xLjgtMi4yLTEuOC0zLjdzLjQtMi43IDEuMy0zLjcgMi0xLjQgMy40LTEuNGM0IDAgNi45IDIuOSA4LjcgOC42bDEuNy0uNS0uNC04LjZ6bS05Ni4yLS45Yy0xLjQtLjctMi45LTEtNC42LTEtMS43IDAtMy40LjctNS4zIDIuMS0xLjkgMS40LTMuMyAzLjMtNC40IDUuOWwuMS04LTE1LjIgM3YxLjRsMS41LjFjMS45LjIgMyAxLjcgMy4yIDQuNC42IDYuMi42IDEyLjggMCAxOS44LS4yIDIuNy0xLjMgNC4xLTMuMiA0LjRsLTEuNS4ydjEuOWgyMS4yVjQ5bC0yLjctLjJjLTEuOS0uMi0zLTEuNy0zLjItNC40LS42LTUuOC0uNy0xMi0uMi0xOC40LjYtMSAxLjktMS42IDMuOS0xLjggMi0uMiA0LjMuNCA2LjcgMS44bDMuNy05LjN6Ij48L3BhdGg+DQo8L3N2Zz4=',
  callToAction: {
    default:
      'Enjoy Forbes Online without any ads for as little as $2 a week. \nPay with Ethereum in just two clicks.',
    confirmed:
      'Thanks a lot for your business! Please tell your friends about us.',
    pending:
      'Thanks a lot for your business. Your transaction is being processed. You should get your NFT as soon as it is confirmed, but you can access the content right now!',
    expired: 'Your membership has now expired. Please purchase a new key now.',
  },
  locks: {
    '0x123': {
      name: 'Config Name',
    },
    '0x456': {},
    '0x789': {},
  },
}

const account = {
  address: '0x123',
  balance: {
    eth: '789',
  },
}

const store = createUnlockStore()

storiesOf('Checkout', module)
  .addDecorator(getStory => (
    <CheckoutWrapper hideCheckout={() => action('hideCheckout')}>
      {getStory()}
    </CheckoutWrapper>
  ))
  .addDecorator(getStory => (
    <ConfigProvider value={config}>
      <Provider store={store}>{getStory()}</Provider>
    </ConfigProvider>
  ))
  .add('Checkout with 3 locks and no pending keys', () => {
    const locks = {
      '0x123': {
        name: 'Weekly',
        address: '0x123',
        keyPrice: '0.1',
        expirationDuration: 60 * 60 * 24 * 7,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
          lock: '0x123',
        },
      },
      '0x456': {
        name: 'Monthly',
        address: '0x456',
        keyPrice: '0.3',
        expirationDuration: 60 * 60 * 24 * 30,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
          lock: '0x456',
        },
      },
      '0x789': {
        name: 'Yearly',
        address: '0x789',
        keyPrice: '3',
        expirationDuration: 60 * 60 * 24 * 365,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
          lock: '0x789',
        },
      },
    }

    return (
      <Checkout
        locks={locks}
        config={paywallConfig}
        account={account}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
      />
    )
  })
  .add('Checkout with 1 lock and no pending keys', () => {
    const locks = {
      '0x123': {
        name: 'Weekly',
        address: '0x123',
        keyPrice: '0.1',
        expirationDuration: 60 * 60 * 24 * 7,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
    }

    return (
      <Checkout
        locks={locks}
        config={paywallConfig}
        account={account}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
      />
    )
  })
  .add('Checkout with 3 locks and one submitted key purchase', () => {
    const locks = {
      '0x123': {
        name: 'Weekly',
        address: '0x123',
        keyPrice: '0.1',
        expirationDuration: 60 * 60 * 24 * 7,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
      '0x456': {
        name: 'Monthly',
        address: '0x456',
        keyPrice: '0.3',
        expirationDuration: 60 * 60 * 24 * 30,
        key: {
          status: 'submitted',
          transactions: [{}],
          expiration: 0, // Technically this would still be 0 since the transaction has not gone through
        },
      },
      '0x789': {
        name: 'Yearly',
        address: '0x789',
        keyPrice: '3',
        expirationDuration: 60 * 60 * 24 * 365,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
    }

    return (
      <Checkout
        locks={locks}
        config={paywallConfig}
        account={account}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
      />
    )
  })
  .add('Checkout with 3 locks and one pending key purchase', () => {
    const locks = {
      '0x123': {
        name: 'Weekly',
        address: '0x123',
        keyPrice: '0.1',
        expirationDuration: 60 * 60 * 24 * 7,
        key: {
          status: 'pending',
          transactions: [{}],
          expiration: 0, // Technically this would still be 0 since the transaction has not gone through
        },
      },
      '0x456': {
        name: 'Monthly',
        address: '0x456',
        keyPrice: '0.3',
        expirationDuration: 60 * 60 * 24 * 30,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
      '0x789': {
        name: 'Yearly',
        address: '0x789',
        keyPrice: '3',
        expirationDuration: 60 * 60 * 24 * 365,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
    }

    return (
      <Checkout
        locks={locks}
        config={paywallConfig}
        account={account}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
      />
    )
  })
  .add('Checkout with 3 locks and one confirming key purchase', () => {
    const locks = {
      '0x123': {
        name: 'Weekly',
        address: '0x123',
        keyPrice: '0.1',
        expirationDuration: 60 * 60 * 24 * 7,
        key: {
          status: 'confirming',
          transactions: [
            {
              confirmations: 3,
            },
          ],
          expiration: new Date().getTime() / 1000 + 60 * 60,
        },
      },
      '0x456': {
        name: 'Monthly',
        address: '0x456',
        keyPrice: '0.3',
        expirationDuration: 60 * 60 * 24 * 30,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
      '0x789': {
        name: 'Yearly',
        address: '0x789',
        keyPrice: '3',
        expirationDuration: 60 * 60 * 24 * 365,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
    }

    return (
      <Checkout
        locks={locks}
        config={paywallConfig}
        account={account}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
      />
    )
  })
  .add('Checkout with 3 locks and two valid key purchases', () => {
    const locks = {
      '0x123': {
        name: 'Weekly',
        address: '0x123',
        keyPrice: '0.1',
        expirationDuration: 60 * 60 * 24 * 7,
        key: {
          status: 'valid',
          transactions: [{}],
          // expiration < 1 minute
          expiration: new Date().getTime() / 1000 + 30,
        },
      },
      '0x456': {
        name: 'Monthly',
        address: '0x456',
        keyPrice: '0.3',
        expirationDuration: 60 * 60 * 24 * 30,
        key: {
          status: 'valid',
          transactions: [],
          // expiration in minutes
          expiration: new Date().getTime() / 1000 + 60 * 20 + 4,
        },
      },
      '0x789': {
        name: 'Yearly',
        address: '0x789',
        keyPrice: '3',
        expirationDuration: 60 * 60 * 24 * 365,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
    }

    return (
      <Checkout
        locks={locks}
        config={paywallConfig}
        account={account}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
      />
    )
  })
  .add('Checkout with no lock loaded yet', () => {
    const locks = {}

    return (
      <Checkout
        locks={locks}
        config={paywallConfigNoNames}
        account={account}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
      />
    )
  })
  .add('Checkout with lock with no name', () => {
    const locks = {
      '0x123': {
        name: '',
        address: '0x123',
        keyPrice: '0.1',
        expirationDuration: 60 * 60 * 24 * 7,
        key: {
          status: 'valid',
          transactions: [{}],
          // expiration in hours
          expiration: new Date().getTime() / 1000 + 60 * 60 + 300,
        },
      },
      '0x456': {
        name: '',
        address: '0x456',
        keyPrice: '0.3',
        expirationDuration: 60 * 60 * 24 * 30,
        key: {
          status: 'valid',
          transactions: [],
          // expiration in rounded up hours
          expiration: new Date().getTime() / 1000 + 60 * 101,
        },
      },
      '0x789': {
        name: 'Has Name',
        address: '0x789',
        keyPrice: '3',
        expirationDuration: 60 * 60 * 24 * 365,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
    }

    return (
      <Checkout
        locks={locks}
        config={paywallConfigNoNames}
        account={account}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
      />
    )
  })

  .add('Checkout with lock with config name override', () => {
    const locks = {
      '0x123': {
        name: 'Overridden',
        address: '0x123',
        keyPrice: '0.1',
        expirationDuration: 60 * 60 * 24 * 7,
        key: {
          status: 'valid',
          transactions: [{}],
          expiration: new Date().getTime() / 1000 + 60 * 60 * 24 * 8,
        },
      },
      '0x456': {
        name: '',
        address: '0x456',
        keyPrice: '0.3',
        expirationDuration: 60 * 60 * 24 * 30,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
      '0x789': {
        name: '',
        address: '0x789',
        keyPrice: '3',
        expirationDuration: 60 * 60 * 24 * 365,
        key: {
          status: 'none',
          transactions: [],
          expiration: 0,
        },
      },
    }

    return (
      <Checkout
        locks={locks}
        config={paywallConfigNoNames}
        account={account}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
      />
    )
  })
