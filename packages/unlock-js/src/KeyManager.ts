import { NetworkConfigs } from '@unlock-protocol/types'
import { ethers } from 'ethers'
import { networks as networkConfigs } from '@unlock-protocol/networks'

export const KeyManagerAbi = [
  'function transfer(address lock, uint token, address owner, uint deadline, bytes memory transferCode)',
  'function setLocksmith(address _locksmith)',
]

export interface TransferCode {
  lock: string
  token: string
  owner: string
  deadline: number
}

export interface CreateTransferSignatureOptions {
  signer: ethers.providers.JsonRpcSigner
  params: TransferCode
  network: number
}

export interface TransferOptions {
  params: TransferCode & {
    transferSignature: string
  }
  network: number
  signer: ethers.providers.JsonRpcSigner
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
  signer: ethers.providers.JsonRpcSigner
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
  signer: ethers.providers.JsonRpcSigner
}
export class KeyManager {
  public networks: NetworkConfigs
  constructor(networks?: NetworkConfigs) {
    this.networks = networks || networkConfigs
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
    const KeyManagerContract = new ethers.Contract(
      keyManagerContractAddress,
      KeyManagerAbi,
      signer
    )
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
   * This function sets the locksmith address.
   */
  async setLocksmith({
    network,
    params: { locksmith },
    signer,
  }: SetLocksmithOptions) {
    const KeyManagerContract = this.getContract({ network, signer })
    const tx = await KeyManagerContract.setLocksmith(locksmith)
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
  createTransferAddressWallet({
    params: { lockAddress, email },
  }: CreateTransferAddressKey) {
    const privateKey = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'string'],
        [lockAddress, email]
      )
    )
    const wallet = new ethers.Wallet(privateKey)
    return wallet.address
  }
}
