import { NetworkConfigs } from '@unlock-protocol/types'
import { ethers } from 'ethers'
import { networks as networkConfigs } from '@unlock-protocol/networks'
import { TransactionOptions } from './types'

export const KeyManagerAbi = [
  'function transfer(address lock, uint256 token, address owner, uint256 deadline, bytes transferCode)',
]

export interface TransferCode {
  lock: string
  token: string
  owner: string
  deadline: number
}

type Signer = ethers.Wallet | ethers.providers.JsonRpcSigner
export interface CreateTransferSignatureOptions {
  signer: Signer
  params: TransferCode
  network: number
}

export interface TransferOptions {
  params: TransferCode & {
    transferSignature: string
  }
  network: number
  signer: Signer
  transactionOptions?: TransactionOptions
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
  signer: Signer
}

export class KeyManager {
  public networks: NetworkConfigs
  constructor(networks?: NetworkConfigs) {
    this.networks = networks || networkConfigs
  }

  providerForNetwork(network: number) {
    if (!this.networks[network]) {
      throw new Error(`Missing config for ${network}`)
    }
    return new ethers.providers.JsonRpcProvider(
      this.networks[network].provider,
      network
    )
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
    return KeyManagerContract.connect(signer)
  }

  /**
   * This function creates a transfer signature.
   */
  async createTransferSignature({
    params,
    signer,
    network,
  }: CreateTransferSignatureOptions) {
    const networkConfig = this.networks[network]
    const domain = {
      name: 'KeyManager',
      version: '1',
      chainId: networkConfig.id,
      verifyingContract: networkConfig.keyManagerAddress,
    }
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
    transactionOptions = {},
  }: TransferOptions) {
    const KeyManagerContract = this.getContract({ network, signer })

    const tx = await KeyManagerContract.populateTransaction.transfer(
      lock,
      token,
      owner,
      deadline,
      transferSignature,
      transactionOptions
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
    return ethers.utils.id(JSON.stringify(params)).slice(0, 42)
  }
}
