import { useEffect, useState } from 'react'

import useWallet from './web3/useWallet'
import usePoll from './utils/usePoll'
import { POLLING_INTERVAL } from '../constants'
import useLocalStorage from './browser/useLocalStorage'
import useConfig from './utils/useConfig'
import {
  makeGetAccount,
  makePollForAccountChange,
} from './asyncActions/accounts'

/**
 * window should be set to falsy if we cannot retrieve the account from localStorage, or store it there
 */
export default function useAccount(window) {
  const web3 = useWallet()
  const { isInIframe } = useConfig()

  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(0)
  const [localStorageAccount, saveLocalStorageAccount] = useLocalStorage(
    window,
    '__unlock__account__'
  )

  // all account/balance retrieval and setting happens here
  const getAccount = makeGetAccount({
    window,
    web3,
    isInIframe,
    localStorageAccount,
    saveLocalStorageAccount,
    setAccount,
    setBalance,
  })
  useEffect(
    () => {
      getAccount()
    },
    [web3] // this effect only runs on mount and when (if) the wallet is ready
  )

  // all polling for changes to account happens here
  const pollForAccountChange = makePollForAccountChange({
    web3,
    isInIframe,
    localStorageAccount,
    account,
    setAccount,
    setBalance,
  })
  usePoll(pollForAccountChange, POLLING_INTERVAL)
  return { account, localStorageAccount, balance }
}
