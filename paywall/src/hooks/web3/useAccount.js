import { useEffect, useState } from 'react'
import Web3Utils from 'web3-utils'

import { lockRoute } from '../../utils/routes'
import useWallet from './useWallet'
import usePoll from '../utils/usePoll'
import { POLLING_INTERVAL } from '../../constants'
import useLocalStorage from '../browser/useLocalStorage'
import useConfig from '../utils/useConfig'
import { getAccounts, getBalance } from '../asyncActions/accounts'

/**
 * window should be set to falsy if we cannot retrieve the account from localStorage, or store it there
 */
export default function useAccount(window, noPoll = false) {
  const wallet = useWallet()
  const { isInIframe } = useConfig()

  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(0)
  const [localStorageAccount, saveLocalStorageAccount] = useLocalStorage(
    window,
    '__unlock__account__'
  )

  const handleAccount = gotAccount => {
    let thisAccount = gotAccount
    if (!thisAccount && isInIframe) {
      // in coinbase wallet, trust wallet, and possibly others,
      // we never have access to the account in an iframe.
      // these fallback systems are used to propagate the
      // account from the location of key purchase to the iframe.
      if (localStorageAccount) {
        // we have previously purchased a key, so we will use the account
        // that was stored in localStorage
        thisAccount = localStorageAccount
      } else {
        const { account: address } = lockRoute(
          // we need the hash in order to retrieve the account from the iframe URL
          window.location.pathname + window.location.hash
        )
        if (address) {
          // we have just been redirected from the key purchase page to here
          // and will save the account address for use the next time
          // a user visits any paywall on the web
          thisAccount = address
          saveLocalStorageAccount(address)
        }
      }
    }
    setAccount(thisAccount)

    getBalance(
      thisBalance => {
        setBalance(Web3Utils.fromWei(thisBalance, 'ether'))
      },
      wallet,
      thisAccount
    )
  }

  // all account/balance retrieval and setting happens here
  useEffect(
    () => {
      if (!wallet) return
      getAccounts(handleAccount, wallet)
    },
    [wallet, localStorageAccount, isInIframe] // this effect only runs on mount and when (if) the wallet is ready
  )

  const pollForAccountChange = () => {
    getAccounts(nextAccount => {
      if (nextAccount !== account) {
        setAccount(nextAccount)
        getBalance(newBalance => setBalance(newBalance), wallet, nextAccount)
      }
    }, wallet)
  }

  usePoll(
    () => {
      // if we are in something like coinbase wallet, and have purchased
      // a key before, then the account is stored in localStorage. In this
      // case, the account will never change, so we don't
      // need to poll
      if (!wallet || noPoll || (isInIframe && localStorageAccount)) return
      pollForAccountChange()
    },
    POLLING_INTERVAL,
    [wallet, noPoll, isInIframe, localStorageAccount]
  )

  return { account, localStorageAccount, balance }
}
