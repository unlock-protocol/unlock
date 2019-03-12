import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'
import createUnlockStore from '../../../createUnlockStore'
import GlobalErrorProvider, {
  GlobalErrorContext,
} from '../../../utils/GlobalErrorProvider'
import { FATAL_NO_USER_ACCOUNT } from '../../../errors'

describe('GlobalErrorProvider', () => {
  function makeTestStore(newValues = {}) {
    return createUnlockStore({
      account: {
        address: '0xdeadbeef',
        balance: '1000',
      },
      network: {
        name: 1984,
      },
      router: {
        route: '/somewhere',
      },
      ...newValues,
    })
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

  it('should populate with missing account error if account is not set', () => {
    expect.assertions(2)

    const store = makeTestStore({
      account: undefined,
    })
    const wrapper = rtl.render(
      <Provider store={store}>
        <GlobalErrorProvider>
          <PeekAtContextConsumer />
        </GlobalErrorProvider>
      </Provider>
    )

    expect(wrapper.getByTestId('error')).toHaveTextContent(
      FATAL_NO_USER_ACCOUNT
    )
    expect(wrapper.getByTestId('errorMetadata')).toHaveTextContent('')
  })
})
