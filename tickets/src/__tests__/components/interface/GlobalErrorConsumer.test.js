import React from 'react'
import * as rtl from 'react-testing-library'

import { Provider } from 'react-redux'
import {
  GlobalErrorConsumer,
  displayError,
  mapStateToProps,
} from '../../../components/interface/GlobalErrorConsumer'
import { FATAL_MISSING_PROVIDER } from '../../../errors'
import { createUnlockStore } from '../../../createUnlockStore'

const store = createUnlockStore({})

describe('GlobalErrorConsumer', () => {
  describe('displayError', () => {
    it('displays the error if initialized', () => {
      expect.assertions(2)
      const wrapper = rtl.render(
        <Provider store={store}>
          {displayError(FATAL_MISSING_PROVIDER, {}, <div>children</div>)}
        </Provider>
      )
      expect(wrapper.queryByText('Wallet missing')).not.toBeNull()
      expect(wrapper.queryByText('children')).toBeNull()
    })

    it('displays the children if no error is initialized', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        <Provider store={store}>
          {displayError(false, {}, <div>children</div>)}
        </Provider>
      )
      expect(wrapper.queryByText('children')).not.toBeNull()
    })
  })

  describe('mapStateToProps', () => {
    it('should only map fatal errors', () => {
      expect.assertions(1)
      const state = {}
      const props = mapStateToProps(state)
      expect(props.error).toBe(undefined)
    })

    it('should not map non fatal errors', () => {
      expect.assertions(1)
      const state = { errors: [{ name: 'AN_ERROR' }] }
      const props = mapStateToProps(state)
      expect(props.error).toBe(undefined)
    })

    it('should map fatal errors', () => {
      expect.assertions(1)
      const state = { errors: [{ name: 'FATAL_ERROR' }] }
      const props = mapStateToProps(state)
      expect(props.error).toEqual({ name: 'FATAL_ERROR' })
    })
  })

  describe('when called with a fatal error', () => {
    it('should invoke displayError with that error', () => {
      expect.assertions(2)
      const fatalError = { name: 'FATAL_ERROR', data: {} }
      const listen = jest.fn(() => <div>internal</div>)
      rtl.render(
        <GlobalErrorConsumer displayError={listen} error={fatalError}>
          <p>App</p>
        </GlobalErrorConsumer>
      )

      expect(listen).toHaveBeenCalledTimes(1)
      expect(listen).toHaveBeenCalledWith(
        fatalError.name,
        fatalError.data,
        <p>App</p>
      )
    })
  })
})
