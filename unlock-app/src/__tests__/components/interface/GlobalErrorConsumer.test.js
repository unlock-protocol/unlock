import React, { createContext } from 'react'
import * as rtl from 'react-testing-library'

import GlobalErrorConsumer, {
  defaultHandlers,
  makeConsumer,
  DummyContext,
} from '../../../components/interface/GlobalErrorConsumer'
import * as errors from '../../../errors'

const ErrorProvider = DummyContext.Provider
const fatalErrors = Object.keys(errors)
  .reduce(
    (coll, error) => (error.match(/^FATAL_/) ? [...coll, error] : coll),
    []
  )
  .sort()

describe('global error consumer', () => {
  it('should have a default handler for every possible fatal error', () => {
    expect.assertions(1)
    const handled = Object.keys(defaultHandlers).sort()

    expect(handled).toEqual(fatalErrors)
  })

  describe('default handlers', () => {
    it('FATAL_MISSING_PROVIDER', () => {
      const wrapper = rtl.render(
        <ErrorProvider
          value={{ error: errors.FATAL_MISSING_PROVIDER, errorMetadata: null }}
        >
          <GlobalErrorConsumer>
            <div>hi</div>
          </GlobalErrorConsumer>
        </ErrorProvider>
      )

      expect(wrapper.queryByText('Wallet missing')).not.toBeNull()
    })
    it('FATAL_WRONG_NETWORK', () => {
      const wrapper = rtl.render(
        <ErrorProvider
          value={{
            error: errors.FATAL_WRONG_NETWORK,
            errorMetadata: {
              currentNetwork: 'Hillbilly',
              requiredNetwork: 'New Hotness',
            },
          }}
        >
          <GlobalErrorConsumer>
            <div>hi</div>
          </GlobalErrorConsumer>
        </ErrorProvider>
      )

      expect(wrapper.queryByText('Network mismatch')).not.toBeNull()
    })
    it('FATAL_NO_USER_ACCOUNT', () => {
      const wrapper = rtl.render(
        <ErrorProvider
          value={{ error: errors.FATAL_NO_USER_ACCOUNT, errorMetadata: null }}
        >
          <GlobalErrorConsumer>
            <div>hi</div>
          </GlobalErrorConsumer>
        </ErrorProvider>
      )

      expect(wrapper.queryByText('Need account')).not.toBeNull()
    })
  })

  describe('makeConsumer', () => {
    const TestContext = createContext()
    const Provider = TestContext.Provider

    function makeTestConsumer(newHandlers = {}) {
      return makeConsumer(newHandlers, TestContext)
    }

    it('returns a default handler if no custom specified', () => {
      const Consumer = makeTestConsumer()

      const wrapper = rtl.render(
        <Provider
          value={{ error: errors.FATAL_MISSING_PROVIDER, errorMetadata: null }}
        >
          <Consumer>
            <div>hi</div>
          </Consumer>
        </Provider>
      )

      expect(wrapper.queryByText('Wallet missing')).not.toBeNull()
    })

    it('calls a custom handler', () => {
      const Consumer = makeTestConsumer({
        // eslint-disable-next-line react/display-name
        FATAL_MISSING_PROVIDER: () => <div>Missing!</div>,
      })

      const wrapper = rtl.render(
        <Provider
          value={{ error: errors.FATAL_MISSING_PROVIDER, errorMetadata: null }}
        >
          <Consumer>
            <div>hi</div>
          </Consumer>
        </Provider>
      )

      expect(wrapper.queryByText('Missing!')).not.toBeNull()
    })
  })

  describe('default behavior', () => {
    it('returns children if there are no errors', () => {
      const wrapper = rtl.render(
        <ErrorProvider value={{ error: false, errorMetadata: null }}>
          <GlobalErrorConsumer>
            <div>hi</div>
          </GlobalErrorConsumer>
        </ErrorProvider>
      )

      expect(wrapper.queryByText('hi')).not.toBeNull()
    })

    it('does not display children if triggered', () => {
      const wrapper = rtl.render(
        <ErrorProvider
          value={{ error: errors.FATAL_MISSING_PROVIDER, errorMetadata: null }}
        >
          <GlobalErrorConsumer>
            <div>hi</div>
          </GlobalErrorConsumer>
        </ErrorProvider>
      )

      expect(wrapper.queryByText('hi')).toBeNull()
    })
  })
})
