import { ethers } from 'ethers'
import { WaasEthersSigner } from 'waas-ethers'
import { InitializeWaas, ProtocolFamily, Wallet } from '@coinbase/waas-sdk-web'
import { getWaasUuid } from '~/utils/waasUuid'

interface WaasProviderOptions {
  provider: ethers.utils.ConnectionInfo | string
}

// WaasProvider implements a subset of Web3 provider functionality, sufficient
// to allow us to use it as a stand-in for MetaMask or other Web3 integration in
// the browser.
export default class WaasProvider extends ethers.providers
  .JsonRpcBatchProvider {
  public wallet: WaasEthersSigner | null

  constructor({ provider }: WaasProviderOptions) {
    super(provider)
    this.wallet = null
  }

  async connect() {
    const waas = await InitializeWaas({
      collectAndReportMetrics: true,
      enableHostedBackups: true,
      prod: false,
      projectId: '5402f17b-ad54-4984-9417-b7b111226080',
    })

    const user = await waas.auth.login({ provideAuthToken: getWaasUuid })

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
    throw new Error('No signer available')
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
