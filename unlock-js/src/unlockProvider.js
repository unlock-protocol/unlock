import { providers } from 'ethers'
import sigUtil from 'eth-sig-util'
import { toBuffer } from 'ethereumjs-utils'
import { getAccountFromPrivateKey } from './accounts'
import UnlockUser from './structured_data/unlockUser'
import UnlockPaymentDetails from './structured_data/unlockPaymentDetails'

// UnlockProvider implements a subset of Web3 provider functionality, sufficient
// to allow us to use it as a stand-in for MetaMask or other Web3 integration in
// the browser.
export default class UnlockProvider extends providers.JsonRpcProvider {
  constructor({ readOnlyProvider }) {
    super(readOnlyProvider)
    this.wallet = null

    // These properties are retained so that we can use them when generating
    // signed typed data for the user account
    this.emailAddress = null
    this.passwordEncryptedPrivateKey = null

    this.isUnlock = true
  }

  // You should be able to just pass the action for
  // GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD into here
  async connect({ key, password, emailAddress }) {
    try {
      this.wallet = await getAccountFromPrivateKey(key, password)
      this.wallet.connect(this)
      this.emailAddress = emailAddress
      this.passwordEncryptedPrivateKey = key

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

  async send(method, params) {
    if (typeof this[method] === 'undefined') {
      // We haven't implemented this method, defer to the fallback provider.
      // TODO: Catch methods we don't want to dispatch and throw an error
      return await super.send(method, params)
    }

    return this[method](params)
  }

  // Signature methods
  // TODO: move these into their own module so they aren't directly accessible
  // on the provider?
  signData(data) {
    const privateKey = toBuffer(this.wallet.privateKey)
    const sig = sigUtil.signTypedData(privateKey, { data })
    return {
      data,
      sig,
    }
  }

  // input conforms to unlockUser structured_data; missing properties default to
  // those stored on provider
  signUserData(input) {
    const user = Object.assign({}, input)
    user.emailAddress = user.emailAddress || this.emailAddress
    user.publicKey = user.publicKey || this.wallet.address
    user.passwordEncryptedPrivateKey =
      user.passwordEncryptedPrivateKey || this.passwordEncryptedPrivateKey

    const data = UnlockUser.build(user)
    return this.signData(data)
  }

  // takes and signs a stripe card token
  signPaymentData(stripeTokenId) {
    const data = UnlockPaymentDetails.build({
      emailAddress: this.emailAddress,
      publicKey: this.wallet.address,
      stripeTokenId,
    })
    return this.signData(data)
  }
}
