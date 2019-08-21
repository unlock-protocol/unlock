import { Provider } from 'react-redux'
import React, { useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import { WindowContext } from '../../hooks/browser/useWindow'
import CheckoutContent from '../../components/content/CheckoutContent'
import {
  POST_MESSAGE_CONFIG,
  POST_MESSAGE_UPDATE_ACCOUNT,
  POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
  POST_MESSAGE_UPDATE_LOCKS,
  POST_MESSAGE_UPDATE_NETWORK,
} from '../../paywall-builder/constants'
import configure from '../../config'

const lockAddress1 = '0x1234567890123456789012345678901234567890'
const lockAddress2 = '0x4567890123456789012345678901234567890123'
const lockAddress3 = '0x7890123456789012345678901234567890123456'
const paywallConfig = {
  icon:
    'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNTQiPg0KICA8cGF0aCBkPSJNMTEzLjMgMTguMmMwLTUuOC4xLTExLjIuNC0xNi4yTDk4LjQgNC45djEuNGwxLjUuMmMxLjEuMSAxLjguNSAyLjIgMS4xLjQuNy43IDEuNy45IDMuMi4yIDIuOS40IDkuNS4zIDE5LjkgMCAxMC4zLS4xIDE2LjgtLjMgMTkuMyA1LjUgMS4yIDkuOCAxLjcgMTMgMS43IDYgMCAxMC43LTEuNyAxNC4xLTUuMiAzLjQtMy40IDUuMi04LjIgNS4yLTE0LjEgMC00LjctMS4zLTguNi0zLjktMTEuNy0yLjYtMy4xLTUuOS00LjYtOS44LTQuNi0yLjYgMC01LjMuNy04LjMgMi4xem0uMyAzMC44Yy0uMi0zLjItLjQtMTIuOC0uNC0yOC41LjktLjMgMi4xLS41IDMuNi0uNSAyLjQgMCA0LjMgMS4yIDUuNyAzLjcgMS40IDIuNSAyLjEgNS41IDIuMSA5LjMgMCA0LjctLjggOC41LTIuNCAxMS43LTEuNiAzLjEtMy42IDQuNy02LjEgNC43LS44LS4yLTEuNi0uMy0yLjUtLjR6TTQxIDNIMXYybDIuMS4yYzEuNi4zIDIuNy45IDMuNCAxLjguNyAxIDEuMSAyLjYgMS4yIDQuOC44IDEwLjguOCAyMC45IDAgMzAuMi0uMiAyLjItLjYgMy44LTEuMiA0LjgtLjcgMS0xLjggMS42LTMuNCAxLjhsLTIuMS4zdjJoMjUuOHYtMmwtMi43LS4yYy0xLjYtLjItMi43LS45LTMuNC0xLjgtLjctMS0xLjEtMi42LTEuMi00LjgtLjMtNC0uNS04LjYtLjUtMTMuN2w1LjQuMWMyLjkuMSA0LjkgMi4zIDUuOSA2LjdoMlYxOC45aC0yYy0xIDQuMy0yLjkgNi41LTUuOSA2LjZsLTUuNC4xYzAtOSAuMi0xNS40LjUtMTkuM2g3LjljNS42IDAgOS40IDMuNiAxMS42IDEwLjhsMi40LS43TDQxIDN6bS00LjcgMzAuOGMwIDUuMiAxLjUgOS41IDQuNCAxMi45IDIuOSAzLjQgNy4yIDUgMTIuNiA1czkuOC0xLjcgMTMtNS4yYzMuMi0zLjQgNC43LTcuNyA0LjctMTIuOXMtMS41LTkuNS00LjQtMTIuOWMtMi45LTMuNC03LjItNS0xMi42LTVzLTkuOCAxLjctMTMgNS4yYy0zLjIgMy40LTQuNyA3LjctNC43IDEyLjl6bTIyLjMtMTEuNGMxLjIgMi45IDEuNyA2LjcgMS43IDExLjMgMCAxMC42LTIuMiAxNS44LTYuNSAxNS44LTIuMiAwLTMuOS0xLjUtNS4xLTQuNS0xLjItMy0xLjctNi44LTEuNy0xMS4zQzQ3IDIzLjIgNDkuMiAxOCA1My41IDE4YzIuMi0uMSAzLjkgMS40IDUuMSA0LjR6bTg0LjUgMjQuM2MzLjMgMy4zIDcuNSA1IDEyLjUgNSAzLjEgMCA1LjgtLjYgOC4yLTEuOSAyLjQtMS4yIDQuMy0yLjcgNS42LTQuNWwtMS0xLjJjLTIuMiAxLjctNC43IDIuNS03LjYgMi41LTQgMC03LjEtMS4zLTkuMi00LTIuMi0yLjctMy4yLTYuMS0zLTEwLjVIMTcwYzAtNC44LTEuMi04LjctMy43LTExLjgtMi41LTMtNi00LjUtMTAuNS00LjUtNS42IDAtOS45IDEuOC0xMyA1LjMtMy4xIDMuNS00LjYgNy44LTQuNiAxMi45IDAgNS4yIDEuNiA5LjQgNC45IDEyLjd6bTcuNC0yNS4xYzEuMS0yLjQgMi41LTMuNiA0LjQtMy42IDMgMCA0LjUgMy44IDQuNSAxMS41bC0xMC42LjJjLjEtMyAuNi01LjcgMS43LTguMXptNDYuNC00Yy0yLjctMS4yLTYuMS0xLjktMTAuMi0xLjktNC4yIDAtNy41IDEuMS0xMCAzLjJzLTMuOCA0LjctMy44IDcuOGMwIDIuNy44IDQuOCAyLjMgNi4zIDEuNSAxLjUgMy45IDIuOCA3IDMuOSAyLjggMSA0LjggMiA1LjggMi45IDEgMSAxLjYgMi4xIDEuNiAzLjYgMCAxLjQtLjUgMi43LTEuNiAzLjctMSAxLjEtMi40IDEuNi00LjIgMS42LTQuNCAwLTcuNy0zLjItMTAtOS42bC0xLjcuNS40IDEwYzMuNiAxLjQgNy42IDIuMSAxMiAyLjEgNC42IDAgOC4xLTEgMTAuNy0zLjEgMi42LTIgMy45LTQuOSAzLjktOC41IDAtMi40LS42LTQuNC0xLjktNS45LTEuMy0xLjUtMy40LTIuOC02LjQtNC0zLjMtMS4yLTUuNi0yLjMtNi44LTMuMy0xLjItMS0xLjgtMi4yLTEuOC0zLjdzLjQtMi43IDEuMy0zLjcgMi0xLjQgMy40LTEuNGM0IDAgNi45IDIuOSA4LjcgOC42bDEuNy0uNS0uNC04LjZ6bS05Ni4yLS45Yy0xLjQtLjctMi45LTEtNC42LTEtMS43IDAtMy40LjctNS4zIDIuMS0xLjkgMS40LTMuMyAzLjMtNC40IDUuOWwuMS04LTE1LjIgM3YxLjRsMS41LjFjMS45LjIgMyAxLjcgMy4yIDQuNC42IDYuMi42IDEyLjggMCAxOS44LS4yIDIuNy0xLjMgNC4xLTMuMiA0LjRsLTEuNS4ydjEuOWgyMS4yVjQ5bC0yLjctLjJjLTEuOS0uMi0zLTEuNy0zLjItNC40LS42LTUuOC0uNy0xMi0uMi0xOC40LjYtMSAxLjktMS42IDMuOS0xLjggMi0uMiA0LjMuNCA2LjcgMS44bDMuNy05LjN6Ij48L3BhdGg+DQo8L3N2Zz4=',
  callToAction: {
    default:
      'Enjoy Forbes Online without any ads for as little as $2 a week. \nPay with Ethereum in just two clicks.',
  },
  locks: {
    [lockAddress1]: {
      name: 'One Week',
    },
    [lockAddress2]: {
      name: 'One Month',
    },
    [lockAddress3]: {
      name: 'One Year',
    },
  },
}

const locks = {
  [lockAddress1]: {
    name: 'Weekly',
    address: lockAddress1,
    keyPrice: '0.1',
    expirationDuration: 60 * 60 * 24 * 7,
    key: {
      status: 'none',
      transactions: [],
      expiration: 0,
      confirmations: 0,
      owner: lockAddress1,
      lock: lockAddress1,
    },
  },
  [lockAddress2]: {
    name: 'Monthly',
    address: lockAddress2,
    keyPrice: '0.3',
    expirationDuration: 60 * 60 * 24 * 30,
    key: {
      status: 'none',
      transactions: [],
      expiration: 0,
      confirmations: 0,
      owner: lockAddress1,
      lock: lockAddress2,
    },
  },
  [lockAddress3]: {
    name: 'Yearly',
    address: lockAddress3,
    keyPrice: '3',
    expirationDuration: 60 * 60 * 24 * 365,
    key: {
      status: 'none',
      transactions: [],
      expiration: 0,
      confirmations: 0,
      owner: lockAddress1,
      lock: lockAddress3,
    },
  },
}

const config = {
  ...configure(),
  requiredNetworkId: 1,
  isServer: false,
  isInIframe: true,
}

const fakeWindow = {
  location: {
    pathname: '/',
    hash: '',
    search: '?origin=origin',
  },
  handlers: {
    message: new Map(),
  },
  parent: {
    postMessage: () => {
      action('postMessage')
    },
  },
  console: window.console,
  addEventListener: (type, cb) => fakeWindow.handlers[type].set(cb, cb),
  removeEventListener: (type, cb) =>
    delete fakeWindow.handlers[type].delete(cb),
}
const store = createUnlockStore({
  currency: {
    USD: '195.99',
  },
})

storiesOf('Checkout page', module)
  // pass in a fake window object, to avoid modifying the real body and munging storyshots
  .addDecorator(getStory => (
    <ConfigContext.Provider value={config}>
      <WindowContext.Provider value={fakeWindow}>
        <Provider store={store}>{getStory()}</Provider>
      </WindowContext.Provider>
    </ConfigContext.Provider>
  ))
  .add('Checkout page', () => {
    // set the data needed to display the checkout
    useEffect(() => {
      const messageTemplate = {
        type: 'message',
        source: fakeWindow.parent,
        origin: 'origin',
      }
      fakeWindow.handlers.message.forEach(postedMessage => {
        postedMessage({
          ...messageTemplate,
          data: {
            type: POST_MESSAGE_CONFIG,
            payload: paywallConfig,
          },
        })
        setTimeout(() => {
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_ACCOUNT,
              payload: lockAddress1,
            },
          })
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
              payload: '889',
            },
          })
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_LOCKS,
              payload: locks,
            },
          })
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_NETWORK,
              payload: 1,
            },
          })
        })
      })
    })
    return <CheckoutContent />
  })
  .add('Checkout page, wrong network', () => {
    // set the data needed to display the checkout
    useEffect(() => {
      const messageTemplate = {
        type: 'message',
        source: fakeWindow.parent,
        origin: 'origin',
      }
      fakeWindow.handlers.message.forEach(postedMessage => {
        postedMessage({
          ...messageTemplate,
          data: {
            type: POST_MESSAGE_CONFIG,
            payload: paywallConfig,
          },
        })
        setTimeout(() => {
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_ACCOUNT,
              payload: lockAddress1,
            },
          })
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
              payload: '889',
            },
          })
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_LOCKS,
              payload: locks,
            },
          })
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_NETWORK,
              payload: 2,
            },
          })
        })
      })
    })
    return <CheckoutContent />
  })
  .add('Checkout page, no wallet', () => {
    // set the data needed to display the checkout
    useEffect(() => {
      const messageTemplate = {
        type: 'message',
        source: fakeWindow.parent,
        origin: 'origin',
      }
      fakeWindow.handlers.message.forEach(postedMessage => {
        postedMessage({
          ...messageTemplate,
          data: {
            type: POST_MESSAGE_CONFIG,
            payload: paywallConfig,
          },
        })
        setTimeout(() => {
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_ACCOUNT,
              payload: null,
            },
          })
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
              payload: '0',
            },
          })
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_LOCKS,
              payload: locks,
            },
          })
          postedMessage({
            ...messageTemplate,
            data: {
              type: POST_MESSAGE_UPDATE_NETWORK,
              payload: 1,
            },
          })
        })
      })
    })
    return <CheckoutContent />
  })
