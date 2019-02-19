import * as rtl from 'react-testing-library'
import PropTypes from 'prop-types'
import React from 'react'
import Web3Utils from 'web3-utils'

import useAccount from '../../../hooks/web3/useAccountFromService'
import {
  WalletServiceContext as WalletContext,
  WalletStateContext,
} from '../../../hooks/components/WalletService'
import { Web3ServiceContext } from '../../../hooks/components/Web3Service'
import { getWeb3ServiceBalance } from '../../../hooks/asyncActions/accounts'
import { ConfigContext } from '../../../hooks/utils/useConfig'

jest.mock('../../../utils/localStorage')
jest.mock('../../../hooks/asyncActions/accounts.js')
jest.useFakeTimers()

describe('useAccountFromService hook', () => {
  let config
  let fakeWindow
  let nextAccount
  let nextBalance
  let wallet
  let web3

  function Wrapper({ children }) {
    return (
      <Web3ServiceContext.Provider value={web3}>
        <WalletContext.Provider value={wallet}>
          <WalletStateContext.Provider
            value={{ account: nextAccount, network: 1, ready: true }}
          >
            <ConfigContext.Provider value={config}>
              {children}
            </ConfigContext.Provider>
          </WalletStateContext.Provider>
        </WalletContext.Provider>
      </Web3ServiceContext.Provider>
    )
  }

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  }

  function MockAccount({ noPoll = true }) {
    const { account, localStorageAccount, balance } = useAccount(
      fakeWindow,
      noPoll
    )
    return (
      <ul>
        <li>{account ? account : 'NO ACCOUNT'}</li>
        <li>
          local: {localStorageAccount ? localStorageAccount : 'NO ACCOUNT'}
        </li>
        <li>{balance}</li>
      </ul>
    )
  }

  MockAccount.propTypes = {
    noPoll: PropTypes.bool, // eslint-disable-line
  }

  beforeEach(() => {
    wallet = {
      eth: {
        getAccounts: () => [nextAccount],
      },
    }
    web3 = {
      eth: {
        getBalance: () => Web3Utils.fromWei(nextBalance, 'ether'),
      },
    }
    nextAccount = 'account'
    nextBalance = '0'

    // mock out synchronous versions of these so the hooks run without pain
    getWeb3ServiceBalance.mockImplementation((handle, web3, account) => {
      // simulate the behavior from the async handler
      if (!account) {
        handle('0')
      } else {
        handle(web3.eth.getBalance())
      }
    })
    config = { isInIframe: true }
    fakeWindow = {
      fakeStorage: {
        __unlock__account__: 'account',
      },
      location: {
        pathname: '',
        hash: '',
      },
      localStorage: {
        setItem(name, value) {
          fakeWindow.fakeStorage[name] = value
        },
        getItem(name) {
          return fakeWindow.fakeStorage[name]
        },
      },
    }
  })
  describe('no wallet', () => {
    it('gets no account if there is no wallet', () => {
      fakeWindow.fakeStorage = {}
      wallet = null
      nextAccount = null
      const wrapper = rtl.render(
        <Wrapper>
          <MockAccount />
        </Wrapper>
      )

      rtl.act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(wrapper.getByText('NO ACCOUNT')).not.toBeNull()
    })
    it('account balance is 0 if there is no wallet', () => {
      fakeWindow.fakeStorage = {}
      wallet = null
      const wrapper = rtl.render(
        <Wrapper>
          <MockAccount />
        </Wrapper>
      )

      rtl.act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(wrapper.getByText('0')).not.toBeNull()
    })
  })

  describe('has account', () => {
    beforeEach(() => {
      nextAccount = 'next account'
      nextBalance = '123000000000000000'
    })

    it('returns the account address', () => {
      const wrapper = rtl.render(
        <Wrapper>
          <MockAccount />
        </Wrapper>
      )

      rtl.act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(wrapper.getByText('next account')).not.toBeNull()
    })

    it('returns the account balance', () => {
      const wrapper = rtl.render(
        <Wrapper>
          <MockAccount />
        </Wrapper>
      )

      rtl.act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(wrapper.getByText('0.123')).not.toBeNull()
    })
  })

  describe('no account', () => {
    beforeEach(() => {
      nextAccount = null
    })

    it('resets balance to 0', () => {
      fakeWindow.fakeStorage.__unlock__account__ = undefined
      nextBalance = '123'

      const wrapper = rtl.render(
        <Wrapper>
          <MockAccount />
        </Wrapper>
      )

      rtl.act(() => {
        jest.runOnlyPendingTimers()
      })

      expect(wrapper.getByText('0')).not.toBeNull()
    })
    describe('in main window', () => {
      beforeEach(() => {
        config.isInIframe = false
      })
      it('has no account', () => {
        const wrapper = rtl.render(
          <Wrapper>
            <MockAccount />
          </Wrapper>
        )

        rtl.act(() => {
          jest.runOnlyPendingTimers()
        })

        expect(wrapper.getByText('NO ACCOUNT')).not.toBeNull()
      })
    })
    describe('in iframe', () => {
      beforeEach(() => {
        config.isInIframe = true
      })
      it('has account in localStorage', () => {
        fakeWindow.fakeStorage.__unlock__account__ = 'local account'

        const wrapper = rtl.render(
          <Wrapper>
            <MockAccount />
          </Wrapper>
        )

        rtl.act(() => {
          jest.runOnlyPendingTimers()
        })

        expect(wrapper.getByText('local account')).not.toBeNull()
        expect(wrapper.getByText('local: local account')).not.toBeNull()
      })
      it('has no account in localStorage, but redirected here from paywall purchase', () => {
        fakeWindow.fakeStorage.__unlock__account__ = undefined
        fakeWindow.location = {
          pathname: '/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/',
          hash: '#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        }

        const wrapper = rtl.render(
          <Wrapper>
            <MockAccount />
          </Wrapper>
        )

        rtl.act(() => {
          jest.runOnlyPendingTimers()
        })

        expect(
          wrapper.getByText('0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54')
        ).not.toBeNull()
        expect(fakeWindow.fakeStorage.__unlock__account__).toBe(
          '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
        )
      })
      it('has no account in localStorage, no redirect', () => {
        fakeWindow.fakeStorage.__unlock__account__ = undefined

        const wrapper = rtl.render(
          <Wrapper>
            <MockAccount />
          </Wrapper>
        )

        rtl.act(() => {
          jest.runOnlyPendingTimers()
        })

        expect(wrapper.getByText('NO ACCOUNT')).not.toBeNull()
        expect(wrapper.getByText('local: NO ACCOUNT')).not.toBeNull()
      })
    })
  })
})
