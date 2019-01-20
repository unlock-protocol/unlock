import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'
import createUnlockStore from '../../../createUnlockStore'

jest.mock('../../../config', () =>
  jest.fn().mockImplementation(() => {
    return {
      providers: {},
      isRequiredNetwork: () => true,
      requiredNetwork: 'dev',
      services: { storage: { host: 'http://atest.url' } },
    }
  })
)

const {
  default: GlobalErrorProvider,
  GlobalErrorContext,
} = require('../../../utils/GlobalErrorProvider')

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
  it('should populate with missing provider error if no wallet is set up', () => {
    expect.assertions(2)

    const store = makeTestStore()
    const wrapper = rtl.render(
      <Provider store={store}>
        <GlobalErrorProvider>
          <PeekAtContextConsumer />
        </GlobalErrorProvider>
      </Provider>
    )

    expect(wrapper.getByTestId('error')).toHaveTextContent('MISSING_PROVIDER')
    expect(wrapper.getByTestId('errorMetadata')).toHaveTextContent('{}')
  })
})
