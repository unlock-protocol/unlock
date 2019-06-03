import { ethers } from 'ethers'
import utils from './utils'

// This files provides ways to interract with an ERC20 contract
export async function getErc20BalanceForAddress(
  erc20ContractAddress,
  lockContractAddress,
  provider
) {
  const contract = new ethers.Contract(
    erc20ContractAddress,
    ['function balanceOf(address tokenOwner) public view returns (uint)'],
    provider
  )
  const balance = await contract.balanceOf(lockContractAddress)
  return utils.toNumber(balance)
}

export default {
  getErc20BalanceForAddress,
}
