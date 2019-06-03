import utils from '../utils'
import { UNLIMITED_KEYS_COUNT, ZERO } from '../constants'

/**
 * Refresh the lock's data.
 * We use the block version
 * @return Promise<Lock>
 */
export default async function(address) {
  const contract = await this.getLockContract(address)
  const attributes = {
    keyPrice: x => utils.fromWei(x, 'ether'),
    expirationDuration: parseInt,
    maxNumberOfKeys: value => {
      if (utils.isInfiniteKeys(value)) {
        return UNLIMITED_KEYS_COUNT
      }
      return utils.toNumber(value)
    },
    owner: x => x,
    totalSupply: parseInt,
    tokenAddress: x => x,
    publicLockVersion: parseInt,
  }

  // Let's load its balance
  const getBalance = async () => {
    const balance = await this.getAddressBalance(address)
    update.balance = balance
  }

  // Let's load the current block to use to compare versions
  const getBlockNumber = async () => {
    const blockNumber = await this.provider.getBlockNumber()
    update.asOf = blockNumber
  }

  const update = {}

  const constantPromises = Object.keys(attributes).map(async attribute => {
    const result = await contract.functions[`${attribute}()`]()
    update[attribute] = attributes[attribute](result) // We cast the value
  })
  constantPromises.push(getBalance(), getBlockNumber())

  await Promise.all(constantPromises)
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
  this.emit('lock.updated', address, update)
  return update
}
