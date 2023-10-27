import { NetworkConfigs } from '@unlock-protocol/types'
import { ethers } from 'ethers'
import { networks as networkConfigs } from '@unlock-protocol/networks'

export const KeyManagerAbi = [
  'function transfer(address lock, uint256 token, address owner, uint256 deadline, bytes transferCode)',
  'function locksmiths(address user) view returns (bool)',
]

export interface TransferObject {
  lock: string
  token: string
  owner: string
  deadline: number
}

type Signer = ethers.Signer | ethers.providers.JsonRpcSigner
export interface CreateTransferSignatureOptions {
  signer: Signer
  params: TransferObject
  network: number
}

export interface TransferOptions {
  params: TransferObject & {
    transferSignature: string
  }
  network: number
  signer: Signer
}

export interface CreateTransferAddressKey {
  params: {
    email: string
    lockAddress: string
  }
}

export interface SetLocksmithOptions {
  params: {
    locksmith: string
  }
  network: number
  signer: Signer
}

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

export class KeyManager {
  public networks: NetworkConfigs
  constructor(networks?: NetworkConfigs) {
    this.networks = networks || networkConfigs
  }

  isSigner(network: number, signer: string) {
    const provider = this.providerForNetwork(network)
    const KeyManagerContract = this.getContract({ network })

    return KeyManagerContract.locksmiths(signer)
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

  getDomain(network: number) {
    const networkConfig = this.networks[network]
    const domain = {
      name: 'KeyManager',
      version: '1',
      chainId: networkConfig.id,
      verifyingContract: networkConfig.keyManagerAddress,
    }
    return domain
  }

  /**
   * This function returns the KeyManager contract for a given network.
   */
  getContract({ network, signer }: GetContractOptions) {
    const networkConfig = this.networks[network]
    const keyManagerContractAddress = networkConfig.keyManagerAddress
    if (!keyManagerContractAddress) {
      throw new Error('No key manager contract address found for network')
    }
    const provider = this.providerForNetwork(network)
    const KeyManagerContract = new ethers.Contract(
      keyManagerContractAddress,
      KeyManagerAbi,
      provider
    )
    if (signer) {
      return KeyManagerContract.connect(signer)
    }
    return KeyManagerContract
  }

  /**
   * This function creates a transfer signature.
   */
  async createTransferSignature({
    params,
    signer,
    network,
  }: CreateTransferSignatureOptions) {
    const domain = this.getDomain(network)
    // @ts-expect-error Property '_signTypedData' does not exist on type 'Signer'. (https://docs.ethers.org/v5/api/signer/#Signer-signTypedData)
    const signature = await signer._signTypedData(domain, TransferTypes, params)
    return signature
  }

  /**
   * This function transfers a key given a transfer signature.
   */
  async transfer({
    network,
    params: { lock, token, owner, deadline, transferSignature },
    signer,
  }: TransferOptions) {
    const KeyManagerContract = this.getContract({ network, signer })

    const tx = await KeyManagerContract.transfer(
      lock,
      token,
      owner,
      deadline,
      transferSignature
    )

    return tx
  }

  /**
   * This function checks if a transfer is possible.
   */
  async isTransferPossible({
    network,
    params: { lock, token, owner, deadline, transferSignature },
    signer,
  }: TransferOptions) {
    const KeyManagerContract = this.getContract({ network, signer })
    const tx = await KeyManagerContract.callStatic.transfer(
      lock,
      token,
      owner,
      deadline,
      transferSignature
    )

    return tx
  }

  /**
   * This function creates a wallet address from a lock address and an email address.
   */
  createTransferAddress({ params }: CreateTransferAddressKey) {
    const item = {
      email: params.email.trim().toLowerCase(),
      lock: params.lockAddress.trim().toLowerCase(),
    }
    return ethers.utils.id(JSON.stringify(item)).slice(0, 42)
  }

  /**
   * Return signer for the transfer signature provided in the params
   */
  getSignerForTransferSignature({
    params: { lock, token, owner, deadline, transferSignature },
    network,
  }: Omit<TransferOptions, 'signer'>) {
    const domain = this.getDomain(network)
    const recoveredAddress = ethers.utils.verifyTypedData(
      domain,
      TransferTypes,
      { lock, token, owner, deadline },
      transferSignature
    )
    return recoveredAddress
  }
}
