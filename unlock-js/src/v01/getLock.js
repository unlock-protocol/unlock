import Web3Utils from 'web3-utils'
import * as UnlockV01 from 'unlock-abi-0-1'
import { MAX_UINT, UNLIMITED_KEYS_COUNT } from '../constants'

/**
 * Refresh the lock's data.
 * We use the block version
 * @return Promise<Lock>
 */
export default function(address) {
  const contract = new this.web3.eth.Contract(UnlockV01.PublicLock.abi, address)
  const attributes = {
    keyPrice: x => Web3Utils.fromWei(x, 'ether'),
    expirationDuration: parseInt,
    maxNumberOfKeys: value => {
      if (value === MAX_UINT) {
        return UNLIMITED_KEYS_COUNT
      }
      return parseInt(value)
    },
    owner: x => x,
    outstandingKeys: parseInt,
  }

  const update = {}

  const constantPromises = Object.keys(attributes).map(attribute => {
    return contract.methods[attribute]()
      .call()
      .then(result => {
        update[attribute] = attributes[attribute](result) // We cast the value
      })
  })

  // Let's load its balance
  constantPromises.push(
    this.getAddressBalance(address).then(balance => {
      update.balance = balance
    })
  )

  // Let's load the current block to use to compare versions
  constantPromises.push(
    this.web3.eth.getBlockNumber().then(blockNumber => {
      update.asOf = blockNumber
    })
  )

  // Once all lock attributes have been fetched
  return Promise.all(constantPromises).then(() => {
    this.emit('lock.updated', address, update)
    return update
  })
}
