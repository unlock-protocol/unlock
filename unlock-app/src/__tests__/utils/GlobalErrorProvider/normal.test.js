import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'
import createUnlockStore from '../../../createUnlockStore'
import GlobalErrorProvider, {
  GlobalErrorContext,
} from '../../../utils/GlobalErrorProvider'

describe('GlobalErrorProvider', () => {
  function makeTestStore(newValues = {}) {
    return createUnlockStore(
      {
        account: {
          address: '0xdeadbeef',
          balance: '1000',
        },
        network: {
          name: 1337,
        },
        router: {
          route: '/somewhere',
        },
        ...newValues,
      },
      undefined,
      true
    )
  }
  // eslint-disable-next-line
  function PeekAtContextConsumer() {
    return (
      <GlobalErrorContext.Consumer>
        {({ error, errorMetadata }) => (
          <div>
            <span data-testid="error">{JSON.stringify(error)}</span>
            <span data-testid="errorMetadata">
              {JSON.stringify(errorMetadata)}
            </span>
          </div>
        )}
      </GlobalErrorContext.Consumer>
    )
  }
  it('should populate with no error normally', () => {
    expect.assertions(2)

    const store = makeTestStore()
    const wrapper = rtl.render(
      <Provider store={store}>
        <GlobalErrorProvider>
          <PeekAtContextConsumer />
        </GlobalErrorProvider>
      </Provider>
    )

    expect(wrapper.getByTestId('error')).toHaveTextContent('false')
    expect(wrapper.getByTestId('errorMetadata')).toHaveTextContent('{}')
  })
  describe('should populate with wrong network error if the wallet is set up on a different network', () => {
    it('mainnet', () => {
      expect.assertions(2)

      const store = makeTestStore({
        network: {
          name: 1,
        },
      })
      const wrapper = rtl.render(
        <Provider store={store}>
          <GlobalErrorProvider>
            <PeekAtContextConsumer />
          </GlobalErrorProvider>
        </Provider>
      )

      expect(wrapper.getByTestId('error')).toHaveTextContent('WRONG_NETWORK')
      expect(wrapper.getByTestId('errorMetadata')).toHaveTextContent(
        JSON.stringify({
          currentNetwork: 'Mainnet',
          requiredNetwork: 'Dev',
        })
      )
    })
    it('rinkeby', () => {
      expect.assertions(2)

      const store = makeTestStore({
        network: {
          name: 4,
        },
      })
      const wrapper = rtl.render(
        <Provider store={store}>
          <GlobalErrorProvider>
            <PeekAtContextConsumer />
          </GlobalErrorProvider>
        </Provider>
      )

      expect(wrapper.getByTestId('error')).toHaveTextContent('WRONG_NETWORK')
      expect(wrapper.getByTestId('errorMetadata')).toHaveTextContent(
        JSON.stringify({
          currentNetwork: 'Rinkeby',
          requiredNetwork: 'Dev',
        })
      )
    })
    it('unknown network', () => {
      expect.assertions(2)

      const store = makeTestStore({
        network: {
          name: 6,
        },
      })
      const wrapper = rtl.render(
        <Provider store={store}>
          <GlobalErrorProvider>
            <PeekAtContextConsumer />
          </GlobalErrorProvider>
        </Provider>
      )

      expect(wrapper.getByTestId('error')).toHaveTextContent('WRONG_NETWORK')
      expect(wrapper.getByTestId('errorMetadata')).toHaveTextContent(
        JSON.stringify({
          currentNetwork: 'Unknown Network',
          requiredNetwork: 'Dev',
        })
      )
    })
  })
  xit('should populate with missing account error if account is not set', () => {})
})
