import { ethers } from 'ethers'
import { InitializeWaas, ProtocolFamily, Wallet } from '@coinbase/waas-sdk-web'
import { StorageService } from './storageService'
import { config } from '~/config/app'
import UnlockUser from '~/structured_data/unlockUser'
import UnlockPaymentDetails from '~/structured_data/unlockPaymentDetails'
import UnlockPurchaseRequest from '~/structured_data/unlockPurchaseRequest'
import EjectionRequest from '~/structured_data/ejectionRequest'
import { WaasEthersSigner } from '~/utils/waas-sdk-ethers'

interface WaasProviderOptions {
  provider: ethers.FetchRequest | string
  email: string
  selectedLoginProvider: string
  token: string
}

// WaasProvider implements a subset of Web3 provider functionality, sufficient
// to allow us to use it as a stand-in for MetaMask or other Web3 integration in
// the browser.
export default class WaasProvider extends ethers.JsonRpcProvider {
  public wallet: WaasEthersSigner | null

  public emailAddress: string
  private selectedLoginProvider: string
  private token: string

  constructor({
    provider,
    email,
    selectedLoginProvider,
    token,
  }: WaasProviderOptions) {
    super(provider)
    this.wallet = null
    this.emailAddress = email
    this.selectedLoginProvider = selectedLoginProvider
    this.token = token
  }

  async connect() {
    try {
      const waas = await InitializeWaas({
        collectAndReportMetrics: true,
        enableHostedBackups: true,
        prod: false,
        projectId: config.coinbaseProjectId,
      })

      const user = await waas.auth.login({
        provideAuthToken: this.getWaasUuid,
      })

      let wallet: Wallet

      if (waas.wallets.wallet) {
        // Resuming wallet
        wallet = waas.wallets.wallet
      } else if (user.hasWallet) {
        // Restoring wallet
        wallet = await waas.wallets.restoreFromHostedBackup()
      } else {
        // Creating wallet
        wallet = await waas.wallets.create()
      }

      const address = await wallet.addresses.for(ProtocolFamily.EVM)

      this.wallet = new WaasEthersSigner(address)

      this.wallet.connect(this)

      return true
    } catch (error) {
      console.log(error)
      throw new Error('Error connecting to provider')
    }

    return false
  }

  getWaasUuid = async (): Promise<string> => {
    const storageService = new StorageService(config.services.storage.host)
    const waasToken = await storageService.getUserWaasUuid(
      this.emailAddress,
      this.selectedLoginProvider,
      this.token
    )

    return waasToken as string
  }

  async eth_accounts() {
    // Must always return an array of addresses
    if (this.wallet) {
      return [this.wallet.getAddress()]
    }
    return []
  }

  // Overriding this method to return the address of the wallet
  /*async listAccounts() {
    if (this.wallet) {
      return [await this.wallet.getAddress()]
    }
    return []
  }*/

  getSigner(): any {
    if (this.wallet) {
      return this.wallet
    }
    console.error('No signer available')
    return null
  }

  async send(method: string, params: any) {
    // @ts-expect-error Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'WaasProvider'
    if (typeof this[method] === 'undefined') {
      // We haven't implemented this method, defer to the fallback provider.
      // TODO: Catch methods we don't want to dispatch and throw an error
      return super.send(method, params)
    }
    // @ts-expect-error Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'WaasProvider'
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
    const content = ethers.getBytes(data)
    const signature = await this.wallet?.signMessage(content)
    return signature
  }

  // TODO: this almost certainly doesn't work
  async eth_signTypedData([_, data]: any[]) {
    const { domain, types, message, messageKey } = data
    return await this.wallet?.signTypedData(domain, types, message[messageKey])
  }

  async eth_signTypedData_v4([_, data]: any[]) {
    const { domain, types, message, primaryType } = JSON.parse(data)
    return this.wallet?.signTypedData(
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
    const signature = await this.wallet?.signTypedData(
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

    const data = UnlockUser.build(user)
    return await this.signData(data)
  }

  // takes and signs a stripe card token
  async signPaymentData(stripeTokenId: string) {
    const data = UnlockPaymentDetails.build({
      emailAddress: this.emailAddress,
      publicKey: (await this.wallet?.getAddress()) as string,
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
        publicKey: (await this.wallet?.getAddress()) as string,
      },
    }
    const data = EjectionRequest.build(ejectionRequest)
    return await this.signData(data)
  }
}
