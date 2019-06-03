import { ethers } from 'ethers'
import sigUtil from 'eth-sig-util'
import { toBuffer } from 'ethereumjs-utils'
import { getAccountFromPrivateKey } from './accounts'

// UnlockProvider implements a subset of Web3 provider functionality, sufficient
// to allow us to use it as a stand-in for MetaMask or other Web3 integration in
// the browser.
export default class UnlockProvider {
  constructor({ readOnlyProvider }) {
    this.fallbackProvider = new ethers.providers.JsonRpcProvider(
      readOnlyProvider
    )
    this.ready = false
    this.wallet = null
  }

  // You should be able to just pass the action for
  // GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD into here
  async connect({ key, password }) {
    try {
      this.wallet = await getAccountFromPrivateKey(key, password)
      this.wallet.connect(this.fallbackProvider)
      this.ready = true

      return true
    } catch (err) {
      // decryption failed (bad password?)
      // Possible also that wallet couldn't connect with provider?
      throw err
    }
  }

  disconnect() {
    return true
  }

  async eth_accounts() {
    // Must always return an array of addresses
    if (this.wallet) {
      return [this.wallet.address]
    }
    return []
  }

  async eth_signTypedData(params) {
    // params is [ account, data ]
    // we don't need account
    const data = params[1]
    const privateKey = toBuffer(this.wallet.privateKey)
    return sigUtil.signTypedData(privateKey, data)
  }

  async send(method, params) {
    if (typeof this[method] === 'undefined') {
      // We haven't implemented this method, defer to the fallback provider.
      // TODO: Catch methods we don't want to dispatch and throw an error
      return this.fallbackProvider.send(method, params)
    }

    return this[method](params)
  }
}
