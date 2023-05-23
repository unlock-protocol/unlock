import { ethers } from 'ethers'
import { getAccountFromPrivateKey } from '../utils/accounts'
import UnlockUser from '../structured_data/unlockUser'
import UnlockPaymentDetails from '../structured_data/unlockPaymentDetails'
import UnlockPurchaseRequest from '../structured_data/unlockPurchaseRequest'
import EjectionRequest from '../structured_data/ejectionRequest'

interface UnlockProviderOptions {
  provider: ethers.utils.ConnectionInfo | string
  id: ethers.providers.Networkish
}
// UnlockProvider implements a subset of Web3 provider functionality, sufficient
// to allow us to use it as a stand-in for MetaMask or other Web3 integration in
// the browser.
export default class UnlockProvider extends ethers.providers
  .JsonRpcBatchProvider {
  public wallet: ethers.Wallet | null

  public emailAddress: string | null

  public passwordEncryptedPrivateKey: string | null

  public isUnlock: boolean;

  // eslint-disable-next-line no-undef
  [key: string]: any

  constructor({ provider, id }: UnlockProviderOptions) {
    super(provider, id)
    this.wallet = null

    // These properties are retained so that we can use them when generating
    // signed typed data for the user account
    this.emailAddress = null
    this.passwordEncryptedPrivateKey = null

    this.isUnlock = true
  }

  static reconnect(
    oldProvider: UnlockProvider,
    { provider, id }: UnlockProviderOptions
  ) {
    const newProvider = new UnlockProvider({ provider, id })
    newProvider.wallet = oldProvider.wallet
    newProvider.wallet!.connect(newProvider)
    newProvider.emailAddress = oldProvider.emailAddress
    newProvider.passwordEncryptedPrivateKey =
      oldProvider.passwordEncryptedPrivateKey
    return newProvider
  }

  async connect({
    key,
    password,
    emailAddress,
  }: Record<'key' | 'password' | 'emailAddress', string>) {
    this.wallet = await getAccountFromPrivateKey(key, password)

    this.wallet.connect(this)

    this.emailAddress = emailAddress
    this.passwordEncryptedPrivateKey = key
    return true
  }

  async eth_accounts() {
    // Must always return an array of addresses
    if (this.wallet) {
      return [this.wallet.address]
    }
    return []
  }

  async send(method: string, params: any) {
    if (typeof this[method] === 'undefined') {
      // We haven't implemented this method, defer to the fallback provider.
      // TODO: Catch methods we don't want to dispatch and throw an error
      return super.send(method, params)
    }
    return this[method](params)
  }

  /**
   * Implementation of personal_sign JSON-RPC call
   * @param {string} data the data to sign.
   * @param {string} _ the address to sign it with -- ignored because
   * we use the address in this class.
   */
  // eslint-disable-next-line no-unused-vars
  async personal_sign([data, _]: any[]) {
    const content = ethers.utils.arrayify(data)
    const signature = await this.wallet?.signMessage(content)
    return signature
  }

  // TODO: this almost certainly doesn't work
  async eth_signTypedData([_, data]: any[]) {
    const { domain, types, message, messageKey } = data
    return await this.wallet?._signTypedData(domain, types, message[messageKey])
  }

  async eth_signTypedData_v4([_, data]: any[]) {
    const { domain, types, message, primaryType } = JSON.parse(data)
    return this.wallet?._signTypedData(
      domain,
      {
        [primaryType]: types[primaryType],
      },
      message
    )
  }

  // Signature methods
  // TODO: move these into their own module so they aren't directly accessible
  // on the provider?
  async signData(data: any) {
    const { domain, types, message, messageKey } = data
    const signature = await this.wallet?._signTypedData(
      domain,
      types,
      message[messageKey]
    )
    return { data, signature }
  }

  // input conforms to unlockUser structured_data; missing properties default to
  // those stored on provider
  async signUserData(input: any) {
    const user = { ...input }
    user.emailAddress = user.emailAddress || this.emailAddress
    user.publicKey = user.publicKey || this.wallet!.address
    user.passwordEncryptedPrivateKey =
      user.passwordEncryptedPrivateKey || this.passwordEncryptedPrivateKey

    const data = UnlockUser.build(user)
    return await this.signData(data)
  }

  // takes and signs a stripe card token
  async signPaymentData(stripeTokenId: string) {
    const data = UnlockPaymentDetails.build({
      emailAddress: this.emailAddress,
      publicKey: this.wallet!.address,
      stripeTokenId,
    })
    return await this.signData(data)
  }

  // input contains recipient and lock addresses
  async signKeyPurchaseRequestData(input: any) {
    // default signature expiration to now + 60 seconds
    const expiry = Math.floor(Date.now() / 1000) + 60
    const purchaseRequest = {
      expiry,
      ...input,
    }
    const data = UnlockPurchaseRequest.build(purchaseRequest)
    return await this.signData(data)
  }

  async generateSignedEjectionRequest() {
    const ejectionRequest = {
      user: {
        publicKey: this.wallet!.address,
      },
    }
    const data = EjectionRequest.build(ejectionRequest)
    return await this.signData(data)
  }
}
