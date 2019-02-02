import React from 'react'
import * as rtl from 'react-testing-library'

import GlobalErrorConsumer, {
  displayError,
} from '../../../components/interface/GlobalErrorConsumer'
import { GlobalErrorContext } from '../../../utils/GlobalErrorProvider'
import {
  FATAL_NO_USER_ACCOUNT,
  FATAL_MISSING_PROVIDER,
  FATAL_WRONG_NETWORK,
} from '../../../errors'

const Provider = GlobalErrorContext.Provider

describe('GlobalErrorConsumer', () => {
  it('passes error initialized with metadata to displayError prop', () => {
    expect.assertions(5)

    const listen = jest.fn(() => <div>internal</div>)
    const wrapper = rtl.render(
      <Provider
        value={{
          error: FATAL_NO_USER_ACCOUNT,
          errorMetadata: { thing: 'thingy' },
        }}
      >
        <GlobalErrorConsumer displayError={listen}>hi</GlobalErrorConsumer>
      </Provider>
    )

    expect(wrapper.queryByText('internal')).not.toBeNull()
    expect(listen).toHaveBeenCalledTimes(1)
    expect(listen.mock.calls[0][2]).toBe(FATAL_NO_USER_ACCOUNT)

    // this next part tests to see if we got the error element and the children
    const Error = listen.mock.calls[0][0]

    const errorWrapper = rtl.render(Error)
    expect(errorWrapper.queryByText('Need account')).not.toBeNull()

    const children = listen.mock.calls[0][1]

    const childrenWrapper = rtl.render(children)
    expect(childrenWrapper.queryByText('hi')).not.toBeNull()
  })
  it('passes false to displayError prop if no error condition is present', () => {
    expect.assertions(3)

    const listen = jest.fn(() => <div>internal</div>)
    const wrapper = rtl.render(
      <Provider
        value={{
          error: false,
          errorMetadata: {},
        }}
      >
        <GlobalErrorConsumer displayError={listen}>hi</GlobalErrorConsumer>
      </Provider>
    )

    expect(wrapper.queryByText('internal')).not.toBeNull()
    expect(listen).toHaveBeenCalledTimes(1)

    expect(listen.mock.calls[0][0]).toBe(false)
  })
  describe('error mappings', () => {
    it('FATAL_MISSING_PROVIDER', () => {
      expect.assertions(2)

      const listen = jest.fn(() => <div>internal</div>)
      rtl.render(
        <Provider
          value={{
            error: FATAL_MISSING_PROVIDER,
            errorMetadata: {},
          }}
        >
          <GlobalErrorConsumer displayError={listen}>hi</GlobalErrorConsumer>
        </Provider>
      )

      expect(listen).toHaveBeenCalledTimes(1)

      const Error = listen.mock.calls[0][0]
      const errorWrapper = rtl.render(Error)
      expect(errorWrapper.queryByText('Wallet missing')).not.toBeNull()
    })
    it('FATAL_WRONG_NETWORK', () => {
      expect.assertions(2)

      const listen = jest.fn(() => <div>internal</div>)
      rtl.render(
        <Provider
          value={{
            error: FATAL_WRONG_NETWORK,
            errorMetadata: {
              requiredNetworkId: 2,
              currentNetwork: 'Fox News',
            },
          }}
        >
          <GlobalErrorConsumer displayError={listen}>hi</GlobalErrorConsumer>
        </Provider>
      )

      expect(listen).toHaveBeenCalledTimes(1)

      const Error = listen.mock.calls[0][0]
      const errorWrapper = rtl.render(Error)
      expect(errorWrapper.queryByText('Network mismatch')).not.toBeNull()
    })
    it('FATAL_NO_USER_ACCOUNT', () => {
      expect.assertions(2)

      const listen = jest.fn(() => <div>internal</div>)
      rtl.render(
        <Provider
          value={{
            error: FATAL_NO_USER_ACCOUNT,
            errorMetadata: {},
          }}
        >
          <GlobalErrorConsumer displayError={listen}>hi</GlobalErrorConsumer>
        </Provider>
      )

      expect(listen).toHaveBeenCalledTimes(1)

      const Error = listen.mock.calls[0][0]
      const errorWrapper = rtl.render(Error)
      expect(errorWrapper.queryByText('Need account')).not.toBeNull()
    })
    it('anything else (*)', () => {
      expect.assertions(2)

      const listen = jest.fn(() => <div>internal</div>)
      rtl.render(
        <Provider
          value={{
            error: 'GOBBLEDEGOOK_ERROR',
            errorMetadata: {},
          }}
        >
          <GlobalErrorConsumer displayError={listen}>hi</GlobalErrorConsumer>
        </Provider>
      )

      expect(listen).toHaveBeenCalledTimes(1)

      const Error = listen.mock.calls[0][0]
      const errorWrapper = rtl.render(Error)
      expect(errorWrapper.queryByText('Fatal Error')).not.toBeNull()
    })
    describe('overrideMapping', () => {
      it('overriding FATAL_NO_USER_ACCOUNT', () => {
        expect.assertions(2)

        const component = () => <div>overrode</div>

        const mapping = {
          FATAL_NO_USER_ACCOUNT: component,
        }
        const wrapper = rtl.render(
          <Provider
            value={{
              error: FATAL_NO_USER_ACCOUNT,
              errorMetadata: {},
            }}
          >
            <GlobalErrorConsumer overrideMapping={mapping}>
              hi
            </GlobalErrorConsumer>
          </Provider>
        )

        // verify that error was overridden
        expect(wrapper.queryByText('overrode')).not.toBeNull()

        const wrapper2 = rtl.render(
          <Provider
            value={{
              error: FATAL_WRONG_NETWORK,
              errorMetadata: {
                requiredNetworkId: 1984,
                currentNetwork: 'Fox News',
              },
            }}
          >
            <GlobalErrorConsumer overrideMapping={mapping}>
              hi
            </GlobalErrorConsumer>
          </Provider>
        )

        // verify other errors are untouched
        expect(wrapper2.queryByText('Network mismatch')).not.toBeNull()
      })
      it('overriding an unknown error', () => {
        expect.assertions(1)

        const component = () => <div>overrode</div>

        const mapping = {
          GOBBLEDEGOOK_ERROR: component,
        }
        const wrapper = rtl.render(
          <Provider
            value={{
              error: 'GOBBLEDEGOOK_ERROR',
              errorMetadata: {},
            }}
          >
            <GlobalErrorConsumer overrideMapping={mapping}>
              hi
            </GlobalErrorConsumer>
          </Provider>
        )

        expect(wrapper.queryByText('overrode')).not.toBeNull()
      })
    })
  })
  describe('displayError', () => {
    it('displays the error if initialized', () => {
      const wrapper = rtl.render(
        displayError(<div>Error Message</div>, <div>children</div>)
      )

      expect(wrapper.queryByText('Error Message')).not.toBeNull()
      expect(wrapper.queryByText('children')).toBeNull()
    })
    it('displays the children if no error is initialized', () => {
      const wrapper = rtl.render(displayError(false, <div>children</div>))

      expect(wrapper.queryByText('Error Message')).toBeNull()
      expect(wrapper.queryByText('children')).not.toBeNull()
    })
  })
})
