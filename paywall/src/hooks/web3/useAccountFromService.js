import { useEffect, useState } from 'react'

import { lockRoute } from '../../utils/routes'
import useWallet from './useWalletService'
import useWeb3 from './useWeb3Service'
import useLocalStorage from '../browser/useLocalStorage'
import useConfig from '../utils/useConfig'
import { getWeb3ServiceBalance } from '../asyncActions/accounts'

/**
 * window should be set to falsy if we cannot retrieve the account from localStorage, or store it there
 */
export default function useAccountFromService(window) {
  const {
    wallet,
    state: { account: walletAccount },
  } = useWallet()
  const web3 = useWeb3()
  const [account, setAccount] = useState(walletAccount)
  const { isInIframe } = useConfig()
  const [balance, setBalance] = useState(0)
  const [localStorageAccount, saveLocalStorageAccount] = useLocalStorage(
    window,
    '__unlock__account__'
  )

  useEffect(
    () => {
      let thisAccount = walletAccount
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

      getWeb3ServiceBalance(
        thisBalance => setBalance(thisBalance),
        web3,
        thisAccount
      )
    },
    [wallet, web3, walletAccount, isInIframe, localStorageAccount]
  )

  return { account, localStorageAccount, balance }
}
