import utils from '../utils'
import { UNLIMITED_KEYS_COUNT } from '../constants'

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
    outstandingKeys: parseInt,
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

  const update = {
    currencyContractAddress: null, // v0 only supports Ether locks
    name: null, // v0 does not support lock names
  }

  const constantPromises = Object.keys(attributes).map(async attribute => {
    const result = await contract.functions[`${attribute}()`]()
    update[attribute] = attributes[attribute](result) // We cast the value
  })
  constantPromises.push(getBalance(), getBlockNumber())

  await Promise.all(constantPromises)
  // Once all lock attributes have been fetched
  this.emit('lock.updated', address, update)
  return update
}
