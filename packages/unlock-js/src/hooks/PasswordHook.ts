import { NetworkConfigs } from '@unlock-protocol/types'
import { ethers } from 'ethers'
import { networks as networkConfigs } from '@unlock-protocol/networks'

export const passwordHookAbi = [
  'function setSigner(address lockAddress, address signer)',
]

type Signer = ethers.Wallet | ethers.providers.JsonRpcSigner

export interface SetSignerProps {
  params: {
    address: string
    signerAddress: string
  }
  network: number
  signer: Signer
}

export interface PasswordHooksProps {
  network: number
  address: string
  signer: Signer
}

export class PasswordHook {
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
   * This function returns the "Password Hook" contract for a given network.
   */
  getContract({ network, address, signer }: PasswordHooksProps) {
    const provider = this.providerForNetwork(network)
    const passwordHookContract = new ethers.Contract(
      address,
      passwordHookAbi,
      provider
    )
    return passwordHookContract.connect(signer)
  }

  /**
   * setSigner function to set custom value
   */
  async setSigner({
    network,
    params: { signerAddress, address },
    signer,
  }: SetSignerProps) {
    const PasswordHookContract = this.getContract({ network, signer, address })

    const tx = await PasswordHookContract.setSigner(address, signerAddress)

    return tx
  }
}
