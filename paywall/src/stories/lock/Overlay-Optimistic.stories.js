import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import Overlay from '../../components/lock/Overlay'
import createUnlockStore from '../../createUnlockStore'
import { GlobalErrorContext } from '../../utils/GlobalErrorProvider'
import { ConfigContext } from '../../utils/withConfig'
import { WindowContext } from '../../hooks/browser/useWindow'
import { TRANSACTION_TYPES } from '../../constants'
import FakeIframe from '../../utils/FakeIframe'

const ErrorProvider = GlobalErrorContext.Provider
const ConfigProvider = ConfigContext.Provider
const WindowProvider = WindowContext.Provider

const fakeWindow = {
  location: {
    href: '/',
    pathname: '',
    search: '',
    hash: '',
  },
  document: { body: { style: {} } },
  matchMedia: global.window
    ? window.matchMedia.bind(window)
    : () => ({
        addListener: () => {},
        removeListener: () => {},
      }),
}

const config = {
  isInIframe: true,
  requiredConfirmations: 12,
}

let store

const locks = [
  {
    address: '0x1234567890123456789012345678901234567890',
    name: 'One Month',
    keyPrice: '0.123',
    expirationDuration: 12345678,
    fiatPrice: '20',
  },
]

const defaultState = {
  currency: {
    USD: 195.99,
  },
  router: {
    location: {
      pathname: '/0x1234567890123456789012345678901234567890',
    },
  },
  account: {
    address: '0x456',
    balance: '2',
  },
  transactions: {
    transaction: {
      id: 'transaction',
      status: 'pending',
      confirmations: 0,
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      key: '0x1234567890123456789012345678901234567890-0x456',
    },
  },
  keys: {
    '0x1234567890123456789012345678901234567890-0x456': {
      id: '0x1234567890123456789012345678901234567890-0x456',
      lock: '0x1234567890123456789012345678901234567890',
      owner: '0x456',
    },
  },
}

function makeStore(state = {}) {
  const mergedState = {
    ...defaultState,
    ...state,
  }
  store = createUnlockStore(mergedState)
}

const render = (
  locks,
  errors = { error: false, errorMetadata: {} },
  thisConfig = config,
  optimism = { current: 0, past: 0 }
) => (
  <Provider store={store}>
    <section>
      <h1>HTML Ipsum Presents</h1>

      <p>
        <strong>Pellentesque habitant morbi tristique</strong> senectus et netus
        et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
        vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet
        quam egestas semper.
        <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo.
        Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat
        wisi, condimentum sed,
        <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum,
        elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
        lacus enim ac dui.
        <a href=".">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.
      </p>

      <h2>Header Level 2</h2>

      <ol>
        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
        <li>Aliquam tincidunt mauris eu risus.</li>
      </ol>

      <blockquote>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          magna. Cras in mi at felis aliquet congue. Ut a est eget ligula
          molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis
          mollis, tellus est malesuada tellus, at luctus turpis elit sit amet
          quam. Vivamus pretium ornare est.
        </p>
      </blockquote>

      <h3>Header Level 3</h3>

      <ul>
        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
        <li>Aliquam tincidunt mauris eu risus.</li>
      </ul>

      <ConfigProvider value={thisConfig}>
        <WindowProvider value={fakeWindow}>
          <ErrorProvider value={errors}>
            <FakeIframe hide={false}>
              <Overlay
                scrollPosition={0}
                locks={locks}
                hideModal={() => {}}
                showModal={() => {}}
                smallBody={() => {}}
                bigBody={() => {}}
                openInNewWindow={false}
                optimism={optimism}
              />
            </FakeIframe>
          </ErrorProvider>
        </WindowProvider>
      </ConfigProvider>
    </section>
  </Provider>
)

storiesOf('Overlay/Optimistic Unlocking', module)
  .add('beginning purchase', () => {
    makeStore()
    return render(locks, undefined, undefined, { current: 1, past: 0 })
  })
  .add('some confirmations', () => {
    makeStore({
      transactions: {
        transaction: {
          ...defaultState.transactions.transaction,
          confirmations: 5,
        },
      },
    })
    return render(locks, undefined, undefined, { current: 1, past: 0 })
  })
  .add('confirmed', () => {
    makeStore({
      transactions: {
        transaction: {
          ...defaultState.transactions.transaction,
          confirmations: 12,
        },
      },
    })
    return render(locks, undefined, undefined, { current: 1, past: 0 })
  })
  .add('beginning purchase (pessimistic)', () => {
    makeStore()
    return render(locks, undefined, undefined, { current: 0, past: 1 })
  })
  .add('some confirmations (pessimistic)', () => {
    makeStore({
      transactions: {
        transaction: {
          ...defaultState.transactions.transaction,
          status: 'mined',
          confirmations: 5,
        },
      },
    })
    return render(locks, undefined, undefined, { current: 0, past: 1 })
  })
  .add('confirmed (pessimistic)', () => {
    makeStore({
      transactions: {
        transaction: {
          ...defaultState.transactions.transaction,
          status: 'mined',
          confirmations: 12,
        },
      },
    })
    return render(locks, undefined, undefined, { current: 0, past: 1 })
  })
