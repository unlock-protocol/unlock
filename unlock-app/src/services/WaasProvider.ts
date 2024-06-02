import { ethers } from 'ethers'
import { WaasEthersSigner } from 'waas-ethers'
import { InitializeWaas, ProtocolFamily, Wallet } from '@coinbase/waas-sdk-web'
import { StorageService } from './storageService'
import { config } from '~/config/app'

interface WaasProviderOptions {
  provider: ethers.utils.ConnectionInfo | string
  email: string
  selectedLoginProvider: string
}

// WaasProvider implements a subset of Web3 provider functionality, sufficient
// to allow us to use it as a stand-in for MetaMask or other Web3 integration in
// the browser.
export default class WaasProvider extends ethers.providers
  .JsonRpcBatchProvider {
  public wallet: WaasEthersSigner | null

  public email: string
  private selectedLoginProvider: string

  constructor({ provider, email, selectedLoginProvider }: WaasProviderOptions) {
    super(provider)
    this.wallet = null
    this.email = email
    this.selectedLoginProvider = selectedLoginProvider
  }

  async connect() {
    try {
      const waas = await InitializeWaas({
        collectAndReportMetrics: true,
        enableHostedBackups: true,
        prod: false,
        projectId: '5402f17b-ad54-4984-9417-b7b111226080',
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
      console.error(error)
    }

    return false
  }

  getWaasUuid = async () => {
    const storageService = new StorageService(config.services.storage.host)
    const waasToken = await storageService.getUserWaasUuid(
      this.email,
      this.selectedLoginProvider
    )

    return waasToken
  }

  async eth_accounts() {
    // Must always return an array of addresses
    if (this.wallet) {
      return [this.wallet.getAddress()]
    }
    return []
  }

  // Overriding this method to return the address of the wallet
  async listAccounts() {
    if (this.wallet) {
      return [await this.wallet.getAddress()]
    }
    return []
  }

  getSigner(addressOrIndex?: string | number | undefined): any {
    if (this.wallet) {
      return this.wallet
    }
    console.error('No signer available')
    return null
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

  async signData(data: any) {
    console.log('Signing data', data)
  }
}
