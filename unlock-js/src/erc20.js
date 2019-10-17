import { ethers } from 'ethers'
import utils from './utils'
import FastJsonRpcSigner from './FastJsonRpcSigner'
import erc20abi from './erc20abi'

// This file provides ways to interact with an ERC20 contract
export async function getErc20BalanceForAddress(
  erc20ContractAddress,
  address,
  provider
) {
  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, provider)
  const balance = await contract.balanceOf(address)
  return utils.hexToNumberString(balance)
}

/**
 * Yiels the decimals for en ERC20 contract
 * @param {*} erc20ContractAddress
 * @param {*} provider
 */
export async function getErc20Decimals(erc20ContractAddress, provider) {
  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, provider)
  let decimals
  try {
    decimals = await contract.decimals()
  } catch (e) {
    /** Some ERC20 contracts do not have the right decimals method. Defaults to 18 */
    return 18
  }
  return utils.toNumber(decimals)
}

/**
 * yields the symbole for the ERC20 contract
 * @param {*} erc20ContractAddress
 * @param {*} provider
 */
export async function getErc20TokenSymbol(erc20ContractAddress, provider) {
  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, provider)
  let symbol
  try {
    symbol = await contract.symbol()
  } catch (e) {
    /** Some ERC20 contracts, including DAI do not have the right symbol method. */
    return null
  }
  return symbol
}

export async function approveTransfer(
  erc20ContractAddress,
  lockContractAddress,
  value,
  provider
) {
  // Using the FastJsonRpcSigner so that we immediately return and not have the user wait for the approval transaction
  // to succeed.
  // TODO: add test to ensure that this is actually retuning instantly?
  const signer = new FastJsonRpcSigner(provider.getSigner())

  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, signer)
  return contract.approve(lockContractAddress, value)
}

export default {
  approveTransfer,
  getErc20BalanceForAddress,
  getErc20Decimals,
  getErc20TokenSymbol,
}
