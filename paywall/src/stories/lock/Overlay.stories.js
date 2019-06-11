import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import Overlay from '../../components/lock/Overlay'
import createUnlockStore from '../../createUnlockStore'
import { GlobalErrorContext } from '../../utils/GlobalErrorProvider'
import { FATAL_WRONG_NETWORK, FATAL_NO_USER_ACCOUNT } from '../../errors'
import { ConfigContext } from '../../utils/withConfig'
import { WindowContext } from '../../hooks/browser/useWindow'
import configure from '../../config'

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
}

const config = configure()

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

const account = {
  address: '0x123',
  balance: '123',
}

const render = (
  locks,
  errors = { error: false, errorMetadata: {} },
  thisConfig = config,
  optimism = { current: 0, past: 0 }
) => (
  <section>
    <h1>HTML Ipsum Presents</h1>

    <p>
      <strong>Pellentesque habitant morbi tristique</strong> senectus et netus
      et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
      vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet
      quam egestas semper.
      <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo.
      Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi,
      condimentum sed,
      <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit
      eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus
      enim ac dui.
      <a href=".">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.
    </p>

    <h2>Header Level 2</h2>

    <ol>
      <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
      <li>Aliquam tincidunt mauris eu risus.</li>
    </ol>

    <blockquote>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna.
        Cras in mi at felis aliquet congue. Ut a est eget ligula molestie
        gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis,
        tellus est malesuada tellus, at luctus turpis elit sit amet quam.
        Vivamus pretium ornare est.
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
          <Overlay
            scrollPosition={0}
            locks={locks}
            hideModal={() => {}}
            showModal={() => {}}
            smallBody={() => {}}
            bigBody={() => {}}
            openInNewWindow={false}
            optimism={optimism}
            keyStatus="none"
            lockKey={{
              lock: locks[0].address,
              owner: 'account',
              expiration:
                new Date('January 30, 3000, 00:00:00').getTime() / 1000,
            }}
            account={account}
          />
        </ErrorProvider>
      </WindowProvider>
    </ConfigProvider>
  </section>
)

storiesOf('Overlay', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('with a single Lock', () => {
    const locks = [
      {
        name: 'One Month',
        keyPrice: '0.123',
        expirationDuration: 12345678,
        fiatPrice: '20',
      },
    ]
    return render(locks)
  })
  .add('with multiple locks', () => {
    const locks = [
      {
        name: 'One Month',
        keyPrice: '0.01',
        expirationDuration: 12345678,
        fiatPrice: '20.54',
      },
      {
        name: 'One Year',
        keyPrice: '0.01',
        expirationDuration: 12345678,
        fiatPrice: '200.27',
      },
    ]
    return render(locks)
  })
  .add('with error', () => {
    const locks = [
      {
        name: 'One Month',
        keyPrice: '0.1234',
        fiatPrice: '20',
      },
    ]
    return render(locks, {
      error: FATAL_WRONG_NETWORK,
      errorMetadata: {
        currentNetwork: 'Foobar',
        requiredNetworkId: 4,
      },
    })
  })
  .add('iframe, account error is ignored', () => {
    const locks = [
      {
        name: 'One Month',
        keyPrice: '0.1234',
        fiatPrice: '20',
      },
    ]
    return render(locks, {
      error: FATAL_NO_USER_ACCOUNT,
      errorMetadata: {},
    })
  })
  .add('main window, account error is displayed', () => {
    const locks = [
      {
        name: 'One Month',
        keyPrice: '0.1234',
        fiatPrice: '20',
      },
    ]
    return render(
      locks,
      {
        error: FATAL_NO_USER_ACCOUNT,
        errorMetadata: {},
      },
      {
        ...config,
        isInIframe: false,
      }
    )
  })
