import { NetworkConfigs } from '@unlock-protocol/types'
import { ethers } from 'ethers'

type Signer = ethers.Wallet | ethers.providers.JsonRpcSigner

export const passwordHookAbi = [
  'function setSigner(address lockAddress, address signer)',
  'function getSigner(string message, bytes signature)',
]

export interface PasswordHooksProps {
  network: number
  address: string
  abi: ethers.ContractInterface
  signer: Signer
}

export default class CustomHookService {
  public networks: NetworkConfigs

  constructor(networks: NetworkConfigs) {
    this.networks = networks
  }

  /**
   * This function returns the "Password Hook" contract for a given network.
   */
  getContract({ network, address, signer, abi }: PasswordHooksProps) {
    const provider = this.providerForNetwork(network)
    const passwordHookContract = new ethers.Contract(address, abi, provider)
    return passwordHookContract.connect(signer)
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
   * Set signer for `Password hook contract`
   */
  async setPasswordHookSigner(
    params: {
      lockAddress: string
      signerAddress: string
      network: number
    },
    signer: Signer
  ) {
    const { lockAddress, signerAddress, network } = params ?? {}
    const contract = await this.getContract({
      network,
      address: lockAddress,
      signer,
      abi: passwordHookAbi,
    })
    return contract.setContractHookSigner(lockAddress, signerAddress)
  }
}
