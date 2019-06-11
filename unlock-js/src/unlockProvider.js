import { providers } from 'ethers'
import sigUtil from 'eth-sig-util'
import { toBuffer } from 'ethereumjs-utils'
import { getAccountFromPrivateKey } from './accounts'

// UnlockProvider implements a subset of Web3 provider functionality, sufficient
// to allow us to use it as a stand-in for MetaMask or other Web3 integration in
// the browser.
export default class UnlockProvider extends providers.JsonRpcProvider {
  constructor({ readOnlyProvider }) {
    super(readOnlyProvider)
    this.wallet = null
    this.emailAddress = null
    this.isUnlock = true
  }

  // You should be able to just pass the action for
  // GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD into here
  async connect({ key, password, emailAddress }) {
    try {
      this.wallet = await getAccountFromPrivateKey(key, password)
      this.wallet.connect(this)
      this.emailAddress = emailAddress

      return true
    } catch (err) {
      // decryption failed (bad password?)
      // Possible also that wallet couldn't connect with provider?
      throw err
    }
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
      return await super.send(method, params)
    }

    return this[method](params)
  }
}
