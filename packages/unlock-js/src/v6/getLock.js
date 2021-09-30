import utils from '../utils'
import { UNLIMITED_KEYS_COUNT, ZERO } from '../constants'
import {
  getErc20BalanceForAddress,
  getErc20Decimals,
  getErc20TokenSymbol,
} from '../erc20'

/**
 * Refresh the lock's data.
 * We use the block version
 * @return Promise<Lock>
 */
export default async function (address, provider) {
  const contract = await this.getLockContract(address, provider)
  const attributes = {
    name: (x) => x,
    keyPrice: (x) => x,
    expirationDuration: parseInt,
    maxNumberOfKeys: (value) => {
      if (utils.isInfiniteKeys(value)) {
        return UNLIMITED_KEYS_COUNT
      }
      return utils.toNumber(value)
    },
    beneficiary: (x) => x,
    totalSupply: parseInt,
    tokenAddress: (x) => x,
    publicLockVersion: parseInt,
  }

  // Let's load the current block to use to compare versions
  const getBlockNumber = async () => {
    const blockNumber = await provider.getBlockNumber()
    update.asOf = blockNumber
  }

  const update = {}

  const constantPromises = Object.keys(attributes).map(async (attribute) => {
    const result = await contract.functions[`${attribute}()`]()
    update[attribute] = attributes[attribute](result[0]) // We cast the value
  })
  constantPromises.push(getBlockNumber())

  await Promise.all(constantPromises)

  if (update.tokenAddress === ZERO) {
    // If ether, the price is stored as Wei.
    update.keyPrice = utils.fromWei(update.keyPrice, 'ether')
    const balance = await provider.getBalance(address)
    update.balance = utils.fromWei(balance, 'ether')
  } else {
    // Otherwise need to get the erc20's decimal and convert from there, as well as the symbol
    // TODO : make these calls in parallel
    const erc20Decimals = await getErc20Decimals(update.tokenAddress, provider)
    const erc20Balance = await getErc20BalanceForAddress(
      update.tokenAddress,
      address,
      provider
    )
    const erc20Symbol = await getErc20TokenSymbol(update.tokenAddress, provider)

    update.keyPrice = utils.fromDecimal(update.keyPrice, erc20Decimals)
    update.balance = utils.fromDecimal(erc20Balance, erc20Decimals)
    update.currencySymbol = erc20Symbol
  }

  // totalSupply was previously called outstandingKeys. In order to keep compatibility
  // we also assign it. This behavior will eventually be deprecated
  update.outstandingKeys = update.totalSupply
  delete update.totalSupply

  // Using `currencyContractAddress` to be consistent with the createLock method
  if (update.tokenAddress === ZERO) {
    update.currencyContractAddress = null
  } else {
    update.currencyContractAddress = update.tokenAddress
  }
  delete update.tokenAddress

  // Once all lock attributes have been fetched
  return update
}
