import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import CheckoutConfirmingModal from '../../components/checkout/CheckoutConfirmingModal'
import CheckoutWrapper from '../../components/checkout/CheckoutWrapper'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'

const hideCheckout = () => {}

const ConfigProvider = ConfigContext.Provider

const config = configure()

const paywallConfig = {
  icon:
    'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNTQiPg0KICA8cGF0aCBkPSJNMTEzLjMgMTguMmMwLTUuOC4xLTExLjIuNC0xNi4yTDk4LjQgNC45djEuNGwxLjUuMmMxLjEuMSAxLjguNSAyLjIgMS4xLjQuNy43IDEuNy45IDMuMi4yIDIuOS40IDkuNS4zIDE5LjkgMCAxMC4zLS4xIDE2LjgtLjMgMTkuMyA1LjUgMS4yIDkuOCAxLjcgMTMgMS43IDYgMCAxMC43LTEuNyAxNC4xLTUuMiAzLjQtMy40IDUuMi04LjIgNS4yLTE0LjEgMC00LjctMS4zLTguNi0zLjktMTEuNy0yLjYtMy4xLTUuOS00LjYtOS44LTQuNi0yLjYgMC01LjMuNy04LjMgMi4xem0uMyAzMC44Yy0uMi0zLjItLjQtMTIuOC0uNC0yOC41LjktLjMgMi4xLS41IDMuNi0uNSAyLjQgMCA0LjMgMS4yIDUuNyAzLjcgMS40IDIuNSAyLjEgNS41IDIuMSA5LjMgMCA0LjctLjggOC41LTIuNCAxMS43LTEuNiAzLjEtMy42IDQuNy02LjEgNC43LS44LS4yLTEuNi0uMy0yLjUtLjR6TTQxIDNIMXYybDIuMS4yYzEuNi4zIDIuNy45IDMuNCAxLjguNyAxIDEuMSAyLjYgMS4yIDQuOC44IDEwLjguOCAyMC45IDAgMzAuMi0uMiAyLjItLjYgMy44LTEuMiA0LjgtLjcgMS0xLjggMS42LTMuNCAxLjhsLTIuMS4zdjJoMjUuOHYtMmwtMi43LS4yYy0xLjYtLjItMi43LS45LTMuNC0xLjgtLjctMS0xLjEtMi42LTEuMi00LjgtLjMtNC0uNS04LjYtLjUtMTMuN2w1LjQuMWMyLjkuMSA0LjkgMi4zIDUuOSA2LjdoMlYxOC45aC0yYy0xIDQuMy0yLjkgNi41LTUuOSA2LjZsLTUuNC4xYzAtOSAuMi0xNS40LjUtMTkuM2g3LjljNS42IDAgOS40IDMuNiAxMS42IDEwLjhsMi40LS43TDQxIDN6bS00LjcgMzAuOGMwIDUuMiAxLjUgOS41IDQuNCAxMi45IDIuOSAzLjQgNy4yIDUgMTIuNiA1czkuOC0xLjcgMTMtNS4yYzMuMi0zLjQgNC43LTcuNyA0LjctMTIuOXMtMS41LTkuNS00LjQtMTIuOWMtMi45LTMuNC03LjItNS0xMi42LTVzLTkuOCAxLjctMTMgNS4yYy0zLjIgMy40LTQuNyA3LjctNC43IDEyLjl6bTIyLjMtMTEuNGMxLjIgMi45IDEuNyA2LjcgMS43IDExLjMgMCAxMC42LTIuMiAxNS44LTYuNSAxNS44LTIuMiAwLTMuOS0xLjUtNS4xLTQuNS0xLjItMy0xLjctNi44LTEuNy0xMS4zQzQ3IDIzLjIgNDkuMiAxOCA1My41IDE4YzIuMi0uMSAzLjkgMS40IDUuMSA0LjR6bTg0LjUgMjQuM2MzLjMgMy4zIDcuNSA1IDEyLjUgNSAzLjEgMCA1LjgtLjYgOC4yLTEuOSAyLjQtMS4yIDQuMy0yLjcgNS42LTQuNWwtMS0xLjJjLTIuMiAxLjctNC43IDIuNS03LjYgMi41LTQgMC03LjEtMS4zLTkuMi00LTIuMi0yLjctMy4yLTYuMS0zLTEwLjVIMTcwYzAtNC44LTEuMi04LjctMy43LTExLjgtMi41LTMtNi00LjUtMTAuNS00LjUtNS42IDAtOS45IDEuOC0xMyA1LjMtMy4xIDMuNS00LjYgNy44LTQuNiAxMi45IDAgNS4yIDEuNiA5LjQgNC45IDEyLjd6bTcuNC0yNS4xYzEuMS0yLjQgMi41LTMuNiA0LjQtMy42IDMgMCA0LjUgMy44IDQuNSAxMS41bC0xMC42LjJjLjEtMyAuNi01LjcgMS43LTguMXptNDYuNC00Yy0yLjctMS4yLTYuMS0xLjktMTAuMi0xLjktNC4yIDAtNy41IDEuMS0xMCAzLjJzLTMuOCA0LjctMy44IDcuOGMwIDIuNy44IDQuOCAyLjMgNi4zIDEuNSAxLjUgMy45IDIuOCA3IDMuOSAyLjggMSA0LjggMiA1LjggMi45IDEgMSAxLjYgMi4xIDEuNiAzLjYgMCAxLjQtLjUgMi43LTEuNiAzLjctMSAxLjEtMi40IDEuNi00LjIgMS42LTQuNCAwLTcuNy0zLjItMTAtOS42bC0xLjcuNS40IDEwYzMuNiAxLjQgNy42IDIuMSAxMiAyLjEgNC42IDAgOC4xLTEgMTAuNy0zLjEgMi42LTIgMy45LTQuOSAzLjktOC41IDAtMi40LS42LTQuNC0xLjktNS45LTEuMy0xLjUtMy40LTIuOC02LjQtNC0zLjMtMS4yLTUuNi0yLjMtNi44LTMuMy0xLjItMS0xLjgtMi4yLTEuOC0zLjdzLjQtMi43IDEuMy0zLjcgMi0xLjQgMy40LTEuNGM0IDAgNi45IDIuOSA4LjcgOC42bDEuNy0uNS0uNC04LjZ6bS05Ni4yLS45Yy0xLjQtLjctMi45LTEtNC42LTEtMS43IDAtMy40LjctNS4zIDIuMS0xLjkgMS40LTMuMyAzLjMtNC40IDUuOWwuMS04LTE1LjIgM3YxLjRsMS41LjFjMS45LjIgMyAxLjcgMy4yIDQuNC42IDYuMi42IDEyLjggMCAxOS44LS4yIDIuNy0xLjMgNC4xLTMuMiA0LjRsLTEuNS4ydjEuOWgyMS4yVjQ5bC0yLjctLjJjLTEuOS0uMi0zLTEuNy0zLjItNC40LS42LTUuOC0uNy0xMi0uMi0xOC40LjYtMSAxLjktMS42IDMuOS0xLjggMi0uMiA0LjMuNCA2LjcgMS44bDMuNy05LjN6Ij48L3BhdGg+DQo8L3N2Zz4=',
  callToAction: {
    default:
      'Enjoy Forbes Online without any ads for as little as $2 a week. Pay with Ethereum in just two clicks.',
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

const account = {
  address: '0x123',
  balance: '789',
}

storiesOf('Checkout/Checkout Confirming modal', module)
  .addDecorator(getStory => (
    <CheckoutWrapper
      hideCheckout={() => action('hideCheckout')}
      icon={paywallConfig.icon}
    >
      {getStory()}
    </CheckoutWrapper>
  ))
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .add('CheckoutConfirmingModal with a submitted key purchase', () => {
    const confirmingLock = {
      name: 'Monthly',
      address: '0x456',
      keyPrice: '0.3',
      expirationDuration: 60 * 60 * 24 * 30,
      key: {
        status: 'submitted',
        transactions: [{}],
        expiration: 0, // Technically this would still be 0 since the transaction has not gone through
      },
    }

    return (
      <CheckoutConfirmingModal
        confirmingLock={confirmingLock}
        config={paywallConfig}
        account={account}
        hideCheckout={hideCheckout}
      />
    )
  })

  .add('CheckoutConfirmingModal with a pending key purchase', () => {
    const confirmingLock = {
      name: 'Monthly',
      address: '0x456',
      keyPrice: '0.3',
      expirationDuration: 60 * 60 * 24 * 30,
      key: {
        status: 'pending',
        transactions: [
          {
            confirmations: 0,
          },
        ],
        expiration: new Date().getTime() / 1000 + 99999,
        confirmations: 0,
      },
    }

    return (
      <CheckoutConfirmingModal
        confirmingLock={confirmingLock}
        config={paywallConfig}
        account={account}
        hideCheckout={hideCheckout}
      />
    )
  })

  .add('CheckoutConfirmingModal with a confirming key purchase', () => {
    const confirmingLock = {
      name: 'Monthly',
      address: '0x456',
      keyPrice: '0.3',
      expirationDuration: 60 * 60 * 24 * 30,
      key: {
        status: 'confirming',
        transactions: [
          {
            confirmations: 2,
          },
        ],
        expiration: new Date().getTime() / 1000 + 99999,
        confirmations: 2,
      },
    }

    return (
      <CheckoutConfirmingModal
        confirmingLock={confirmingLock}
        config={paywallConfig}
        account={account}
        hideCheckout={hideCheckout}
      />
    )
  })
