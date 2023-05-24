import { ethers } from 'ethers'
import utils from './utils'
import erc20abi from './erc20abi'

// The SAI contract does not have the symbol method implemented correctly
const SAI_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'.toLowerCase()

export const TransferWithAuthorizationTypes = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
}

export async function getErc20BalanceForAddress(
  erc20ContractAddress: string,
  address: string,
  provider: ethers.providers.Provider
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
export async function getErc20Decimals(
  erc20ContractAddress: string,
  provider: ethers.providers.Provider
) {
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
export async function getErc20TokenSymbol(
  erc20ContractAddress: string,
  provider: ethers.providers.Provider
) {
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
  erc20ContractAddress: string,
  lockContractAddress: string,
  provider: ethers.providers.Provider,
  spenderAddress: string
) {
  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, provider)
  let amount = ethers.BigNumber.from(0)
  try {
    amount = await contract.allowance(spenderAddress, lockContractAddress)
  } catch (e) {
    // if no amount was allowed, some provider will fail.
  }
  return amount
}

export async function approveTransfer(
  erc20ContractAddress: string,
  lockContractAddress: string,
  value: unknown,
  provider: ethers.providers.Provider,
  signer: ethers.Signer
) {
  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, signer)
  return contract.approve(lockContractAddress, value)
}

interface TransferAuthorizationMessage {
  from: string
  to: string
  value: any
  validAfter: number
  validBefore: number
  nonce: string
}

/**
 * Computes the domain separator for a given ERC20 contract
 * Note: some contracts may not have `version()` or `name()` implemented correctly.
 * @param chainId
 * @param erc20ContractAddress
 * @param provider
 * @returns
 */
const getDomain = async (
  chainId: number,
  erc20ContractAddress: string,
  provider: ethers.providers.Provider
) => {
  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, provider)

  let version = '1' // default to 1
  try {
    version = await contract.version()
  } catch (error) {
    console.error(
      `We could not retrieve the version of ${erc20ContractAddress} using the version() method. Defaulting to ${version}`
    )
  }

  const name = await contract.name()

  // On Polygon, the typehash is ... different.
  if (chainId === 137) {
    return {
      name,
      version,
      salt: ethers.utils.zeroPad(ethers.utils.arrayify(137), 32),
      verifyingContract: ethers.utils.getAddress(erc20ContractAddress),
    }
  }
  return {
    name,
    version,
    chainId,
    verifyingContract: ethers.utils.getAddress(erc20ContractAddress),
  }
}

export async function signTransferAuthorization(
  erc20ContractAddress: string,
  message: TransferAuthorizationMessage,
  provider: ethers.providers.Provider,
  signer: ethers.Signer
) {
  const { chainId } = await provider.getNetwork()
  const domain = await getDomain(chainId, erc20ContractAddress, provider)
  // @ts-expect-error Property '_signTypedData' does not exist on type 'Signer'.ts(2339)
  return signer._signTypedData(domain, TransferWithAuthorizationTypes, message)
}

export async function recoverTransferAuthorization(
  erc20ContractAddress: string,
  message: TransferAuthorizationMessage,
  chainId: number,
  signature: string,
  provider: any
) {
  const domain = await getDomain(chainId, erc20ContractAddress, provider)
  return ethers.utils.verifyTypedData(
    domain,
    TransferWithAuthorizationTypes,
    message,
    signature
  )
}

export async function transferWithAuthorization(
  erc20ContractAddress: string,
  message: TransferAuthorizationMessage,
  signature: string,
  signer: ethers.Signer
) {
  const contract = new ethers.Contract(erc20ContractAddress, erc20abi, signer)
  const { v, r, s } = ethers.utils.splitSignature(signature)

  return contract.transferWithAuthorization(
    message.from,
    message.to,
    message.value,
    message.validAfter,
    message.validBefore,
    message.nonce,
    v,
    r,
    s
  )
}

export default {
  approveTransfer,
  getAllowance,
  getErc20BalanceForAddress,
  getErc20Decimals,
  getErc20TokenSymbol,
}
