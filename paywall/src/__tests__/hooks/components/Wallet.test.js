import React from 'react'
import PropTypes from 'prop-types'
import * as rtl from 'react-testing-library'
import MockWeb3 from 'web3'

import Wallet, {
  useCreateWallet,
  WalletContext,
} from '../../../hooks/components/Wallet'
import { ConfigContext } from '../../../hooks/utils/useConfig'
import { MISSING_PROVIDER, NOT_ENABLED_IN_PROVIDER } from '../../../errors'

jest.mock('web3')

describe('Wallet component', () => {
  const { Provider } = ConfigContext

  let config

  class Catcher extends React.Component {
    static propTypes = {
      children: PropTypes.node.isRequired,
    }
    state = {
      error: '',
    }
    componentDidCatch(error) {
      this.setState({ error: error.message })
    }

    render() {
      const { children } = this.props
      const { error } = this.state
      if (error) return <div>{error}</div>
      return <>{children}</>
    }
  }

  function wrapper(props) {
    return (
      <Catcher>
        <Provider value={config} {...props} />
      </Catcher>
    )
  }

  describe('useCreateWallet', () => {
    function expectError(cb, err) {
      // Record all errors.
      let topLevelErrors = []
      function handleTopLevelError(event) {
        topLevelErrors.push(event.error)
        // Prevent logging
        event.preventDefault()
      }
      window.addEventListener('error', handleTopLevelError)
      try {
        cb()
        expect(topLevelErrors).toHaveLength(1)
        expect(topLevelErrors[0].message).toBe(err)
      } finally {
        window.removeEventListener('error', handleTopLevelError)
      }
    }
    beforeEach(() => {
      config = { providers: ['first'] }
    })

    it('throws if there are no providers', () => {
      config.providers = []

      expectError(() => {
        rtl.testHook(() => useCreateWallet(), { wrapper })
      }, MISSING_PROVIDER)
    })

    it('throws if the provider enable fails', () => {
      config.providers = [
        {
          enable: () => {
            throw 'nope'
          },
        },
      ]

      expectError(() => {
        rtl.testHook(() => useCreateWallet(), { wrapper })
      }, NOT_ENABLED_IN_PROVIDER)
    })

    it('throws if Web3 throws in constructor', () => {
      config.providers = ['hi']
      MockWeb3.mockImplementationOnce(() => {
        throw new Error('nope')
      })
      expectError(() => {
        rtl.act(() => {
          rtl.testHook(() => useCreateWallet(), { wrapper })
        })
      }, MISSING_PROVIDER)
    })

    it('returns a new Web3 object if success occurs', () => {
      // note: we can't test a provider with enable working because the asynchronous call to
      // enable results in 2 scheduler cycles. rtl.act() is unable to capture this condition
      // so the next best is just to show that we do in fact return a Web3 object when
      // setup() is called. Coupled with the test above that proves
      // enable is called if it is present on the provider and we are covered
      config.providers = ['hi']
      const fakeWeb3 = {
        I: 'am a web3 with a spout and a handle',
      }
      MockWeb3.mockImplementationOnce(() => {
        return fakeWeb3
      })

      const {
        result: { current: web3 },
      } = rtl.testHook(() => useCreateWallet(), { wrapper })

      expect(web3).toBe(fakeWeb3)
    })
  })
  describe('Wallet', () => {
    it('passes down the wallet instance', () => {
      config.providers = ['hi']
      const fakeWeb3 = {
        I: 'am a web3 with a spout and a handle',
      }
      MockWeb3.mockImplementationOnce(() => {
        return fakeWeb3
      })

      const Wrapper = wrapper

      let render = 0

      // there are 2 valid states for the wallet:
      // 1. Prior to initialization, it will be undefined
      // 2. After initialization it will be the wallet object
      // 3. (I lied) any errors that occur will be thrown (tested above)
      rtl.render(
        <Wrapper>
          <Wallet>
            <WalletContext.Consumer>
              {wallet => {
                switch (render++) {
                  case 0:
                    expect(wallet).toBe(undefined)
                    break
                  case 1:
                    expect(wallet).toBe(fakeWeb3)
                }
              }}
            </WalletContext.Consumer>
          </Wallet>
        </Wrapper>
      )
    })
  })
})
