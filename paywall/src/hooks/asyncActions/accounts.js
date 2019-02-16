import Web3Utils from 'web3-utils'

import { lockRoute } from '../../utils/routes'

export function makeGetAccount({
  window,
  web3,
  isInIframe,
  localStorageAccount,
  saveLocalStorageAccount,
  setAccount,
  setBalance,
}) {
  const getAccount = async () => {
    if (!web3) return
    let thisAccount = null
    let balance = '0'
    try {
      const accounts = await web3.eth.getAccounts()
      thisAccount = accounts[0]
      if (!thisAccount) thisAccount = null
    } catch (e) {
      // ignore
      thisAccount = null
    }
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

    if (thisAccount) {
      // we only retrieve the balance if we have a real account
      balance = await web3.eth.getBalance(thisAccount)
    }
    // see note above about this hack for testing
    setBalance(Web3Utils.fromWei(balance, 'ether'))
  }
  return getAccount
}

export function makePollForAccountChange({
  web3,
  isInIframe,
  localStorageAccount,
  account,
  setAccount,
  setBalance,
}) {
  const pollForAccountChange = async () => {
    // if we are in something like coinbase wallet, and have purchased
    // a key before, then the account is stored in localStorage. In this
    // case, the account will never change, so we don't
    // need to poll
    if (isInIframe && localStorageAccount) return
    try {
      const nextAccounts = await web3.eth.getAccounts()
      const next = nextAccounts && nextAccounts[0]
      if (next !== account) {
        setAccount(next)
        if (next) {
          const balance = await web3.eth.getBalance(next)
          setBalance(Web3Utils.fromWei(balance, 'ether'))
        } else {
          // reset the balance to 0 for logged out user in
          // case we had a balance with the old account
          setBalance('0')
        }
      }
    } catch (e) {
      // swallow
    }
  }
  return pollForAccountChange
}
