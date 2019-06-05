import * as rtl from 'react-testing-library'
import React from 'react'

import { mapErrorToComponent } from '../../../components/creator/FatalError'
import {
  FATAL_MISSING_PROVIDER,
  FATAL_NO_USER_ACCOUNT,
  FATAL_WRONG_NETWORK,
} from '../../../errors'

import Error from '../../../utils/Error'

const { Application } = Error

describe('FatalError', () => {
  describe('mapErrorToComponent', () => {
    describe('maps errors to default components', () => {
      it('FATAL_MISSING_PROVIDER', () => {
        expect.assertions(0)
        const component = mapErrorToComponent(
          Application.Fatal(FATAL_MISSING_PROVIDER)
        )
        const wrapper = rtl.render(component)
        wrapper.getByText('Wallet missing')
      })

      it('FATAL_NO_USER_ACCOUNT', () => {
        expect.assertions(0)
        const component = mapErrorToComponent(
          Application.Fatal(FATAL_NO_USER_ACCOUNT)
        )
        const wrapper = rtl.render(component)
        wrapper.getByText('Need account')
      })

      it('FATAL_WRONG_NETWORK', () => {
        expect.assertions(0)
        const component = mapErrorToComponent(
          Application.Fatal(FATAL_WRONG_NETWORK, {
            currentNetwork: 'foo',
            requiredNetworkId: 1,
          })
        )
        const wrapper = rtl.render(component)
        wrapper.getByText('Network mismatch')
      })

      it('*', () => {
        expect.assertions(0)
        const component = mapErrorToComponent(Application.Fatal('whatever'))

        const wrapper = rtl.render(component)
        wrapper.getByText('Fatal Error')
      })

      it('override', () => {
        expect.assertions(0)
        function Component() {
          return <div>My error</div>
        }
        const component = mapErrorToComponent(
          Application.Fatal(FATAL_NO_USER_ACCOUNT),
          {
            FATAL_NO_USER_ACCOUNT: Component,
          }
        )
        const wrapper = rtl.render(component)
        wrapper.getByText('My error')
      })
    })
  })
})
