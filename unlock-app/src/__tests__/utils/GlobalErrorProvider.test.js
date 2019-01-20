import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'

import GlobalErrorProvider, {
  GlobalErrorContext,
} from '../../utils/GlobalErrorProvider'
import createUnlockStore from '../../createUnlockStore'
import configuration from '../../config'

const config = configuration()

describe('GlobalErrorProvider', () => {
  function makeTestStore(newValues = {}) {
    return createUnlockStore({
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
    })
  }

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
  xit('should populate with missing provider error if no wallet is set up', () => {})
  xit('should populate with wrong network error if the wallet is set up on a different network', () => {})
  xit('should populate with missing account error if account is not set', () => {})
})
