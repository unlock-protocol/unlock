import { ethers } from 'ethers'

export default class TokenTransferApproval {
  provider: ethers.providers.Provider

  privateKey: string

  constructor(provider: string, privateKey: string) {
    this.provider = new ethers.providers.JsonRpcBatchProvider(provider)
    this.privateKey = privateKey
  }

  async approve(
    value: string,
    lockContractAddress: string,
    erc20ContractAddress: string
  ) {
    const wallet = new ethers.Wallet(this.privateKey, this.provider)

    const contract = new ethers.Contract(
      erc20ContractAddress,
      ['function approve(address spender, uint256 value) returns (bool value)'],
      wallet
    )
    return await contract.approve(lockContractAddress, value)
  }
}
