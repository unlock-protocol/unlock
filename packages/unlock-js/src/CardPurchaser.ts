import { NetworkConfigs } from '@unlock-protocol/types'
import { ethers } from 'ethers'
import { networks as networkConfigs } from '@unlock-protocol/networks'

type Signer = ethers.Wallet | ethers.providers.JsonRpcSigner

export const TransferTypes = {
  Transfer: [
    { name: 'lock', type: 'address' },
    { name: 'token', type: 'uint256' },
    { name: 'owner', type: 'address' },
    { name: 'deadline', type: 'uint256' },
  ],
}

export interface GetContractOptions {
  network: number
  signer?: Signer
}

export const CardPurchaserAbi = []

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
    const cardPurchaserContractAddress = networkConfig.cardPurchaserAddress
    if (!cardPurchaserContractAddress) {
      throw new Error('No card purchaser contract address found for network')
    }
    const provider = this.providerForNetwork(network)
    const cardPurchaserContract = new ethers.Contract(
      cardPurchaserContractAddress,
      CardPurchaserAbi,
      provider
    )
    if (signer) {
      return cardPurchaserContract.connect(signer)
    }
    return cardPurchaserContract
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
    const provider = this.providerForNetwork(network)
    const networkConfig = this.networks[network]
    const cardPurchaserAddress = networkConfig?.cardPurchaserAddress

    if (!cardPurchaserAddress) {
      throw new Error('Card Purchaser not available for this network')
    }

    const { chainId } = await provider.getNetwork()
    const contract = new ethers.Contract(
      cardPurchaserAddress,
      CardPurchaserAbi,
      provider
    )

    const domain = {
      name: await contract.name(),
      version: await contract.version(),
      chainId,
      verifyingContract: contract.address,
    }

    const types = {
      Purchase: [
        { name: 'lock', type: 'address' },
        { name: 'sender', type: 'address' },
        { name: 'expiration', type: 'uint256' },
      ],
    }

    const now = Math.floor(new Date().getTime() / 1000)

    const message = {
      sender: await signer.getAddress(),
      lock: lockAddress,
      expiration: now + 60 * 60 * 24, // 1 hour!
    }

    const signature = signer._signTypedData(domain, types, message)
    return { signature, message }
  }
}
