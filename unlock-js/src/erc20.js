import { ethers } from 'ethers'
import utils from './utils'

// This file provides ways to interact with an ERC20 contract
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
  return utils.hexToNumberString(balance)
}

/**
 * Yiels the decimals for en ERC20 contract
 * @param {*} erc20ContractAddress
 * @param {*} provider
 */
export async function getErc20Decimals(erc20ContractAddress, provider) {
  const contract = new ethers.Contract(
    erc20ContractAddress,
    ['function decimals() public view returns (uint)'],
    provider
  )
  const decimals = await contract.decimals()
  return utils.toNumber(decimals)
}

export async function approveTransfer(
  erc20ContractAddress,
  lockContractAddress,
  value,
  provider
) {
  const contract = new ethers.Contract(
    erc20ContractAddress,
    ['function approve(address spender, uint256 value) returns (bool value)'],
    provider.getSigner()
  )
  return contract.approve(lockContractAddress, value)
}

export default {
  approveTransfer,
  getErc20BalanceForAddress,
  getErc20Decimals,
}
