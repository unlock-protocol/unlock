import * as rtl from 'react-testing-library'
import React from 'react'

import { wrapperMaker } from './helpers'
import useAccount from '../../hooks/useAccount'
import usePoll from '../../hooks/utils/usePoll'
import useLocalStorage from '../../hooks/browser/useLocalStorage'
import { POLLING_INTERVAL } from '../../constants'
import { WalletContext } from '../../hooks/components/Wallet'
import {
  makeGetAccount,
  makePollForAccountChange,
} from '../../hooks/asyncActions/accounts'

// we are going to mock out everything possible
// in order to deal with asynchrony and hooks
// React testing has not yet caught up with async functions in hooks
// and this is the cleanest way to easily test them
jest.mock('../../hooks/utils/usePoll')
jest.mock('../../hooks/browser/useLocalStorage')
jest.mock('../../hooks/asyncActions/accounts.js')

describe('useAccount hook', () => {
  let config
  let fakeWindow
  let wallet
  let InnerWrapper
  let getAccount
  let pollForAccounts

  // wrapper to use with rtl's testHook
  // allows us to pass in the mock wallet
  // the InnerWrapper is pulled from the test helpers file
  // and includes passing in mock config and testing for errors
  // thrown in hooks
  function wrapper(props) {
    return (
      <WalletContext.Provider value={wallet}>
        <InnerWrapper {...props} />
      </WalletContext.Provider>
    )
  }

  beforeEach(() => {
    getAccount = jest.fn()
    pollForAccounts = jest.fn()
    makeGetAccount.mockImplementation(() => getAccount)
    makePollForAccountChange.mockImplementation(() => pollForAccounts)
    useLocalStorage.mockImplementation(() => ['local', () => {}])
    config = { isInIframe: true }
    InnerWrapper = wrapperMaker(config)
    wallet = 'wallet'
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

  it('calls makeGetAccount', () => {
    expect.assertions(1)

    rtl.testHook(() => useAccount(fakeWindow), { wrapper })

    expect(makeGetAccount).toHaveBeenCalledWith({
      window: fakeWindow,
      web3: 'wallet',
      isInIframe: true,
      localStorageAccount: 'local',
      saveLocalStorageAccount: expect.any(Function),
      setAccount: expect.any(Function),
      setBalance: expect.any(Function),
    })
  })
  it('calls useLocalStorage', () => {
    expect.assertions(1)

    rtl.testHook(() => useAccount(fakeWindow), { wrapper })

    expect(useLocalStorage).toHaveBeenCalledWith(
      fakeWindow,
      '__unlock__account__'
    )
  })
  it('calls makePollForAccount', () => {
    expect.assertions(1)

    rtl.testHook(() => useAccount(fakeWindow), { wrapper })

    expect(makePollForAccountChange).toHaveBeenCalledWith({
      web3: 'wallet',
      isInIframe: true,
      localStorageAccount: 'local',
      account: null,
      setAccount: expect.any(Function),
      setBalance: expect.any(Function),
    })
  })
  it('calls useEffect with getAccount', () => {
    expect.assertions(1)

    rtl.testHook(() => useAccount(fakeWindow), { wrapper })

    expect(getAccount).toHaveBeenCalled()
  })
  it('calls usePoll with pollForAccounts', () => {
    expect.assertions(1)

    rtl.testHook(() => useAccount(fakeWindow), { wrapper })

    expect(usePoll).toHaveBeenCalledWith(pollForAccounts, POLLING_INTERVAL)
  })
})
