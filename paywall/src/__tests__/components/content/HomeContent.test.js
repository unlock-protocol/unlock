import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import HomeContent from '../../../components/content/HomeContent'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'
import { WindowContext } from '../../../hooks/browser/useWindow'

jest.useFakeTimers()
describe('Paywall home page component', () => {
  const lock = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
  const account = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
  const transaction =
    '0x1bd7cf2e0d9f7ede3473ba1588fa5258a4920d57e9c97cd10350c7482d3cbff2'
  it('should return the landing page if no lock is passed', () => {
    expect.assertions(2)
    const component = rtl.render(<HomeContent path="/" />)

    expect(component.getByText('Pay for Content Seamlessly')).not.toBeNull()
    expect(component.queryByText('30 days')).toBeNull()
  })
  it('should return the paywall if a lock is passed', () => {
    expect.assertions(2)
    const config = {
      isInIframe: false,
      isServer: false,
      providers: { HTTP: {} },
    }
    const store = createUnlockStore({
      account: {
        address: account,
        balance: '99.90635546',
      },
      locks: {
        [lock]: {
          address: lock,
          asOf: 1174,
          keyPrice: '0.01',
          expirationDuration: 2592000,
          maxNumberOfKeys: 10,
          owner: account,
          outstandingKeys: 0,
          balance: '0',
        },
      },
      transactions: {
        [transaction]: {
          hash: transaction,
          status: 'mined',
          type: 'LOCK_CREATION',
          confirmations: 1168,
          blockNumber: 6,
          lock,
        },
      },
      router: {
        location: {
          pathname: `/${lock}`,
          search: '',
          hash: '',
        },
      },
      currency: {
        USD: 136.68,
      },
    })
    const component = rtl.render(
      <Provider store={store}>
        <WindowContext.Provider value={window}>
          <ConfigContext.Provider value={config}>
            <HomeContent path={`/${lock}`} />
          </ConfigContext.Provider>
        </WindowContext.Provider>
      </Provider>
    )

    jest.runAllTimers()

    expect(component.queryByText('Pay for Content Seamlessly')).toBeNull()
    expect(component.getByText('30 days')).not.toBeNull()
  })
})
