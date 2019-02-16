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
      if (!thisAccount) {
        thisAccount = null
        throw new Error('no account found')
      }
    } catch (e) {
      if (isInIframe) {
        if (localStorageAccount) {
          thisAccount = localStorageAccount
        } else {
          const { account: address } = lockRoute(
            // we need the hash in order to retrieve the account from the iframe URL
            window.location.pathname + window.location.hash
          )
          if (address) {
            thisAccount = address

            saveLocalStorageAccount(address)
          }
        }
      }
    }
    setAccount(thisAccount)

    if (thisAccount) {
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
          setBalance('0')
        }
      }
    } catch (e) {
      // swallow
    }
  }
  return pollForAccountChange
}
