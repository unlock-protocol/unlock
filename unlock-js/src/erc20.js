import { ethers } from 'ethers'
import utils from './utils'
import erc20abi from './erc20abi'

// The SAI contract does not have the symbol method implemented correctly
const SAI_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'.toLowerCase()

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
  // The SAI contract has its symbol not implemented
  if (erc20ContractAddress.toLowerCase() === SAI_ADDRESS) {
    return 'SAI'
  }
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

/**
 * Yields the amount that a purchaser have approved a lock for
 * @param {*} erc20ContractAddress
 * @param {*} purchaser
 * @param {*} lockContractAddress
 * @param {*} provider
 */
export async function getAllowance(
  erc20ContractAddress,
  lockContractAddress,
  provider,
  signer
) {
  const purchaser = await signer.getAddress()
  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, provider)
  let amount = '0'
  try {
    amount = await contract.allowance(purchaser, lockContractAddress)
  } catch (e) {
    // if no amount was allowed, some provider will fail.
  }
  return amount
}

export async function approveTransfer(
  erc20ContractAddress,
  lockContractAddress,
  value,
  provider,
  signer
) {
  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, signer)
  return contract.approve(lockContractAddress, value)
}

export default {
  approveTransfer,
  getAllowance,
  getErc20BalanceForAddress,
  getErc20Decimals,
  getErc20TokenSymbol,
}
