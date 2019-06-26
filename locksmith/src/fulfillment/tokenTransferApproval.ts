import { ethers } from 'ethers'

export default class TokenTransferApproval {
  provider: ethers.providers.JsonRpcProvider
  privateKey: string

  constructor(provider: string, credentials: string) {
    this.provider = new ethers.providers.JsonRpcProvider(provider)
    this.privateKey = credentials
  }

  async approve(
    value: string,
    lockContractAddress: string,
    erc20ContractAddress: string
  ) {
    let wallet = new ethers.Wallet(this.privateKey, this.provider)

    const contract = new ethers.Contract(
      erc20ContractAddress,
      ['function approve(address spender, uint256 value) returns (bool value)'],
      wallet
    )
    return await contract.approve(lockContractAddress, value)
  }
}
