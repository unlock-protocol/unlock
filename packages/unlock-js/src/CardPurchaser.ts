import { NetworkConfigs } from '@unlock-protocol/types'
import { ethers } from 'ethers'
import { networks as networkConfigs } from '@unlock-protocol/networks'
import { CardPurchaserABI } from './abis/CardPurchaserABI'

type Signer = ethers.Wallet | ethers.providers.JsonRpcSigner

export interface GetContractOptions {
  network: number
  signer?: Signer
}

export const PurchaseTypes = {
  Purchase: [
    { name: 'lock', type: 'address' },
    { name: 'sender', type: 'address' },
    { name: 'expiration', type: 'uint256' },
  ],
}

export class CardPurchaser {
  public networks: NetworkConfigs

  constructor(networks?: NetworkConfigs) {
    this.networks = networks || networkConfigs
  }

  providerForNetwork(network: number) {
    if (!this.networks[network]) {
      throw new Error(`Missing config for ${network}`)
    }
    return new ethers.providers.JsonRpcBatchProvider(
      this.networks[network].provider,
      network
    )
  }

  /**
   * Returns the contract
   * @param param0
   * @returns
   */
  getContract({ network, signer }: GetContractOptions) {
    const networkConfig = this.networks[network]
    const cardPurchaserContractAddress =
      networkConfig?.universalCard?.cardPurchaserAddress
    if (!cardPurchaserContractAddress) {
      throw new Error('No card purchaser contract address found for network')
    }
    const provider = this.providerForNetwork(network)
    const cardPurchaserContract = new ethers.Contract(
      cardPurchaserContractAddress,
      CardPurchaserABI,
      provider
    )
    if (signer) {
      return cardPurchaserContract.connect(signer)
    }
    return cardPurchaserContract
  }

  async getDomain(network: number) {
    const contract = this.getContract({ network })
    const [name, version] = await Promise.all([
      contract.name(),
      contract.version(),
    ])

    return {
      name,
      version,
      chainId: network,
      verifyingContract: contract.address,
    }
  }

  /**
   * Returns a message and corresponding signature to perform a purchase
   * These will be submitted to the purchase function on the CardPurchaser contract
   * @param network
   * @param lockAddress
   * @param signer
   * @returns
   */
  async getPurchaseAuthorizationSignature(
    network: number,
    lockAddress: string,
    signer: Signer
  ) {
    const networkConfig = this.networks[network]
    const cardPurchaserAddress =
      networkConfig?.universalCard?.cardPurchaserAddress

    if (!cardPurchaserAddress) {
      throw new Error('Card Purchaser not available for this network')
    }

    const domain = await this.getDomain(network)
    const now = Math.floor(new Date().getTime() / 1000)

    const message = {
      sender: await signer.getAddress(),
      lock: lockAddress,
      expiration: now + 60 * 60, // 1 hour!
    }

    // @ts-expect-error Property '_signTypedData' does not exist on type 'Signer'.ts(2339)
    const signature = await signer._signTypedData(
      domain,
      PurchaseTypes,
      message
    )
    return { signature, message }
  }

  /**
   *
   * @param network
   * @param transfer
   * @param purchase
   * @param callData
   * @param signer
   */
  async purchase(
    network: number,
    transfer: any,
    purchase: any,
    callData: any,
    signer: Signer
  ) {
    const contract = this.getContract({ network })

    return contract
      .connect(signer)
      .purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        callData
      )
  }
}
