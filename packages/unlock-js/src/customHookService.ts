import { ethers } from 'ethers'
import UnlockService from './unlockService'

type Signer = ethers.Wallet | ethers.providers.JsonRpcSigner

export const passwordHookAbi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [], name: 'NOT_AUTHORIZED', type: 'error' },
  { inputs: [], name: 'WRONG_PASSWORD', type: 'error' },
  {
    inputs: [
      { internalType: 'string', name: 'message', type: 'string' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'getSigner',
    outputs: [
      { internalType: 'address', name: 'recoveredAddress', type: 'address' },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'keyPurchasePrice',
    outputs: [
      { internalType: 'uint256', name: 'minKeyPrice', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'onKeyPurchase',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'lock', type: 'address' },
      { internalType: 'address', name: 'signer', type: 'address' },
    ],
    name: 'setSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'signers',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'toString',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'value', type: 'uint256' }],
    name: 'toString',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'toString',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'value', type: 'bytes32' }],
    name: 'toString',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
]

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
