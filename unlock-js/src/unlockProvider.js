import { ethers } from 'ethers'
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

  async eth_accounts(respond) {
    // Must always return an array of addresses
    if (this.wallet) {
      respond([this.wallet.address])
    } else {
      respond([])
    }
  }

  send(args, cb) {
    const { id, jsonrpc, method } = args
    // Calling respond with some argument will call the callback with
    // a "fake" JSON-RPC response constructed by the provider.
    const respond = result => {
      cb(null, {
        id,
        jsonrpc,
        result,
      })
    }

    try {
      return this[method](respond)
    } catch (err) {
      // We haven't implemented this method, defer to the fallback provider.
      // TODO: Catch methods we don't want to dispatch and throw an error
      return this.fallbackProvider.send(args, cb)
    }
  }
}
