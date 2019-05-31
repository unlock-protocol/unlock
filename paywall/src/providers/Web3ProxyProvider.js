import { iframePostOffice } from '../utils/postOffice'
import {
  POST_MESSAGE_WEB3,
  POST_MESSAGE_READY_WEB3,
  POST_MESSAGE_WALLET_INFO,
} from '../paywall-builder/constants'
import { waitFor } from '../utils/promises'

/**
 * an iframe->main window web3 wallet proxy provider
 *
 * This provider allows WalletService to interface with a wallet it
 * does not directly have access to
 *
 * It is used to proxy all net calls to the main window, including transactions
 * It also returns results from the main window, which must be running
 * `web3Proxy` as a listener for the postMessage calls
 */
export default class Web3ProxyProvider {
  constructor(window) {
    // set up the post office inside the iframe
    const { postMessage, addHandler } = iframePostOffice(window)
    this.postMessage = postMessage
    this.waiting = true

    // this is the postMessage version of connecting to the wallet
    addHandler(POST_MESSAGE_WALLET_INFO, walletInfo => {
      if (!walletInfo || typeof walletInfo !== 'object') {
        return
      }
      this.isMetamask = !!walletInfo.isMetamask
      this.noWallet = !!walletInfo.noWallet
      this.notEnabled = !!walletInfo.notEnabled
      // now we are ready to do work
      this.waiting = false
    })

    // this is the postMessage version of the callback for sendAsync
    addHandler(POST_MESSAGE_WEB3, web3Result => {
      if (
        !web3Result.hasOwnProperty('error') ||
        !web3Result.hasOwnProperty('result')
      ) {
        return
      }
      const { result, error } = web3Result
      const id = result.id
      if (!this.requests[id]) {
        // no pending request with that id
        return
      }
      const callback = this.requests[id]
      delete this.requests[id]
      result.id = 42 // ethers needs to not do this...
      callback(error, result)
    })

    this.id = 0
    this.requests = {}

    this.noWallet = true // until we hear back from the main window
    this.postMessage(POST_MESSAGE_READY_WEB3)
  }

  /**
   * @param {object} methodCall this object contains the method and params for the json-rpc call
   * @param {function} callback this is a standard node callback
   */
  async sendAsync({ method, params }, callback) {
    // don't do anything until we have heard back on the wallet status
    await waitFor(() => !this.waiting)
    if (this.noWallet) {
      callback(new Error('no ethereum wallet is available'))
      return
    }
    if (this.notEnabled) {
      callback(new Error('user declined to enable the ethereum wallet'))
      return
    }
    const id = ++this.id // ethers always uses 42, so we will use our own id
    this.requests[id] = callback
    const payload = { method, params, id }
    this.postMessage(POST_MESSAGE_WEB3, payload)
  }
}
