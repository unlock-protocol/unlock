import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../../createUnlockStore'

import {
  GlobalErrorConsumer,
  mapStateToProps,
} from '../../../components/interface/GlobalErrorConsumer'
import { FATAL_MISSING_PROVIDER } from '../../../errors'
import { ConfigContext } from '../../../utils/withConfig'
import Error from '../../../utils/Error'

const config = {
  unlockStaticUrl: 'https://foo/bar',
}

describe('GlobalErrorConsumer', () => {
  describe('mapStateToProps', () => {
    it('should only map fatal errors', () => {
      expect.assertions(1)
      const state = {
        errors: [],
      }
      const props = mapStateToProps(state)
      expect(props.error).toBe(undefined)
    })

    it('should not map non fatal errors', () => {
      expect.assertions(1)
      const state = { errors: [Error.Storage.Warning('PC Load Letter')] }
      const props = mapStateToProps(state)
      expect(props.error).toBe(undefined)
    })

    it('should map fatal errors', () => {
      expect.assertions(1)
      const state = {
        errors: [
          Error.Storage.Warning('PC Load Letter'),
          Error.Application.Fatal('fatal error'),
        ],
      }
      const props = mapStateToProps(state)
      expect(props.error).toEqual(
        expect.objectContaining({
          message: 'fatal error',
        })
      )
    })
  })

  describe('when called with a fatal error', () => {
    it('should invoke display the error', () => {
      expect.assertions(0)
      const fatalError = Error.Application.Fatal(FATAL_MISSING_PROVIDER)
      const { getByText } = rtl.render(
        <Provider store={createUnlockStore()}>
          <ConfigContext.Provider value={config}>
            <GlobalErrorConsumer error={fatalError}>
              <p>App</p>
            </GlobalErrorConsumer>
          </ConfigContext.Provider>
        </Provider>
      )

      getByText('Wallet missing')
    })
  })
})
