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
}
