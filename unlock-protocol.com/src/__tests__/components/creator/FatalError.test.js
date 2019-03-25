import * as rtl from 'react-testing-library'
import React from 'react'

import { mapErrorToComponent } from '../../../components/creator/FatalError'
import {
  FATAL_MISSING_PROVIDER,
  FATAL_NO_USER_ACCOUNT,
  FATAL_WRONG_NETWORK,
} from '../../../errors'

describe('FatalError', () => {
  describe('mapErrorToComponent', () => {
    describe('maps errors to default components', () => {
      it('FATAL_MISSING_PROVIDER', () => {
        expect.assertions(1)
        const component = mapErrorToComponent(FATAL_MISSING_PROVIDER, {})
        const wrapper = rtl.render(component)
        expect(wrapper.queryByText('Wallet missing')).not.toBeNull()
      })

      it('FATAL_NO_USER_ACCOUNT', () => {
        expect.assertions(1)
        const component = mapErrorToComponent(FATAL_NO_USER_ACCOUNT, {})
        const wrapper = rtl.render(component)
        expect(wrapper.queryByText('Need account')).not.toBeNull()
      })

      it('FATAL_WRONG_NETWORK', () => {
        expect.assertions(1)
        const component = mapErrorToComponent(FATAL_WRONG_NETWORK, {
          currentNetwork: 'foo',
          requiredNetworkId: 1,
        })
        const wrapper = rtl.render(component)
        expect(wrapper.queryByText('Network mismatch')).not.toBeNull()
      })

      it('*', () => {
        expect.assertions(1)
        const component = mapErrorToComponent('whatever', {
          title: 'some error',
        })
        const wrapper = rtl.render(component)
        expect(wrapper.queryByText('some error')).not.toBeNull()
      })

      it('override', () => {
        expect.assertions(1)
        function Component() {
          return <div>My error</div>
        }
        const component = mapErrorToComponent(
          FATAL_NO_USER_ACCOUNT,
          {},
          {
            FATAL_NO_USER_ACCOUNT: Component,
          }
        )
        const wrapper = rtl.render(component)
        expect(wrapper.queryByText('My error')).not.toBeNull()
      })
    })
  })
})
