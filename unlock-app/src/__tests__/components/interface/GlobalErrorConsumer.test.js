import React from 'react'
import * as rtl from 'react-testing-library'

import GlobalErrorConsumer, {
  displayError,
} from '../../../components/interface/GlobalErrorConsumer'
import { GlobalErrorContext } from '../../../utils/GlobalErrorProvider'
import { FATAL_NO_USER_ACCOUNT, FATAL_MISSING_PROVIDER } from '../../../errors'

const Provider = GlobalErrorContext.Provider

describe('GlobalErrorConsumer', () => {
  it('passes error and errorMetadata to displayError prop', () => {
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

    expect(wrapper.getByText('internal')).not.toBeNull()
    expect(listen).toHaveBeenCalledTimes(1)

    expect(listen.mock.calls[0][0]).toBe(FATAL_NO_USER_ACCOUNT)
    expect(listen.mock.calls[0][1]).toEqual({ thing: 'thingy' })
    // this next part tests to see if we got the error element and the children
    const children = listen.mock.calls[0][2]

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
  describe('displayError', () => {
    it('displays the error if initialized', () => {
      const wrapper = rtl.render(
        displayError(FATAL_MISSING_PROVIDER, {}, <div>children</div>)
      )

      expect(wrapper.queryByText('Wallet missing')).not.toBeNull()
      expect(wrapper.queryByText('children')).toBeNull()
    })
    it('displays the children if no error is initialized', () => {
      const wrapper = rtl.render(displayError(false, {}, <div>children</div>))

      expect(wrapper.queryByText('children')).not.toBeNull()
    })
  })
})
