import { ethers } from 'ethers'
import UnlockService from './unlockService'
import { passwordHookAbi } from './abis/passwordHookAbi'

type Signer = ethers.Wallet | ethers.providers.JsonRpcSigner

export interface ContractHooksProps {
  network: number
  address: string
  abi: ethers.ContractInterface
  signer: Signer
}

export class CustomHookService extends UnlockService {
  getHookContract({ network, address, signer, abi }: ContractHooksProps) {
    const provider = this.providerForNetwork(network)
    const contract = new ethers.Contract(address, abi, provider)
    return contract.connect(signer)
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
    const contract = this.getHookContract({
      network,
      address: signerAddress,
      abi: passwordHookAbi,
      signer,
    })
    return contract.setSigner(lockAddress, signerAddress)
  }

  /**
   * Get signer for `Password hook contract`
   */
  async getPasswordHookSigners(
    params: {
      lockAddress: string
      contractAddress: string
      network: number
    },
    signer: Signer
  ) {
    const { lockAddress, network } = params ?? {}

    const lockContract = await this.getLockContract(
      lockAddress,
      this.providerForNetwork(network)
    )
    const address = await lockContract.onTokenURIHook({ lockAddress, network })

    const contract = this.getHookContract({
      network,
      address,
      abi: passwordHookAbi,
      signer,
    })
    return contract.signers(lockAddress)
  }
}
